#[test_only]
module gaming::loot_box_tests {
    use sui::test_scenario::{self, Scenario};
    use sui::sui::SUI;
    use sui::coin::{self, Coin};
    use sui::test_utils::{assert_eq};
    use sui::random::{self, Random};
    use std::string;
    use gaming::loot_box::{self, GameConfig, LootBox, GameItem, AdminCap};

    const ADMIN: address = @0xAD;
    const USER: address = @0xB0B;
    const USER2: address = @0xC0C;

    // Standard box price in the contract is 10_000_000_000 SUI Mist (10 SUI)
    const BOX_PRICE: u64 = 10_000_000_000;

    // --- Helpers ---

    /// Setup the environment: initializes the module and the randomness state
    fun setup_test(scenario: &mut Scenario) {
        test_scenario::next_tx(scenario, ADMIN);
        let mut ctx = test_scenario::ctx(scenario);
        
        // Call init to setup the GameConfig and AdminCap
        loot_box::init_for_testing(&mut ctx);
        
        // Initialize the global Random object for testing
        random::create_for_testing(&mut ctx);
    }

    /// Helper to purchase a box and return it so we can open it
    fun buy_box(scenario: &mut Scenario): LootBox {
        test_scenario::next_tx(scenario, USER);
        let mut config = test_scenario::take_shared<GameConfig>(scenario);
        let payment = coin::mint_for_testing<SUI>(BOX_PRICE, test_scenario::ctx(scenario));
        
        loot_box::purchase_loot_box(&mut config, payment, test_scenario::ctx(scenario));
        
        test_scenario::return_shared(config);
        
        test_scenario::next_tx(scenario, USER);
        let box = test_scenario::take_from_address<LootBox>(scenario, USER);
        box
    }

    // --- Tests ---

    #[test]
    fun test_initialization() {
        let mut scenario = test_scenario::begin(ADMIN);
        setup_test(&mut scenario);

        test_scenario::next_tx(&mut scenario, ADMIN);
        
        // 1. Verify AdminCap went to admin
        let admin_cap = test_scenario::take_from_address<AdminCap>(&scenario, ADMIN);
        test_scenario::return_to_address(ADMIN, admin_cap);
        
        // 2. Verify GameConfig is shared and has correct default values
        let config = test_scenario::take_shared<GameConfig>(&scenario);
        
        let weights = loot_box::get_rarity_weights(&config);
        assert_eq(weights, vector[60, 25, 12, 3]);
        assert_eq(loot_box::get_price(&config), BOX_PRICE);

        test_scenario::return_shared(config);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_purchase_flow() {
        let mut scenario = test_scenario::begin(ADMIN);
        setup_test(&mut scenario);

        // USER purchases a loot box
        test_scenario::next_tx(&mut scenario, USER);
        let mut config = test_scenario::take_shared<GameConfig>(&scenario);
        let payment = coin::mint_for_testing<SUI>(BOX_PRICE, test_scenario::ctx(&mut scenario));
        
        loot_box::purchase_loot_box(&mut config, payment, test_scenario::ctx(&mut scenario));
        test_scenario::return_shared(config);

        // Verify the user received a LootBox
        test_scenario::next_tx(&mut scenario, USER);
        let box = test_scenario::take_from_address<LootBox>(&scenario, USER);
        
        // Return resources
        test_scenario::return_to_address(USER, box);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_secure_randomness() {
        let mut scenario = test_scenario::begin(ADMIN);
        setup_test(&mut scenario);

        // Buy a box
        let box = buy_box(&mut scenario);

        // Mock randomness to dictate the roll
        test_scenario::next_tx(&mut scenario, USER);
        let mut config = test_scenario::take_shared<GameConfig>(&scenario);
        let mut r = test_scenario::take_shared<Random>(&scenario);

        // We update randomness state with 32 zero bytes; 
        // Zeroes tend to pull the generated u8 towards 0 depending on the internal PRNG.
        // A lower roll (< 60) gives Common according to the weights. 
        random::update_randomness_state_for_testing(
            &mut r,
            1,
            x"0000000000000000000000000000000000000000000000000000000000000000",
            test_scenario::ctx(&mut scenario)
        );

        loot_box::open_loot_box(&mut config, box, &r, test_scenario::ctx(&mut scenario));

        test_scenario::return_shared(config);
        test_scenario::return_shared(r);

        // Verify the user received a GameItem as a result of the predictability
        test_scenario::next_tx(&mut scenario, USER);
        let item = test_scenario::take_from_address<GameItem>(&scenario, USER);
        
        // Since we fed zeros, the randomness logic generated a small u8 value yielding "Common"
        let rarity = loot_box::get_rarity(&item);
        // It's predictable, we check that it's successfully minted based on weights.
        assert_eq(rarity, string::utf8(b"Common"));

        loot_box::burn_for_testing(item);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_pity_system_verification() {
        let mut scenario = test_scenario::begin(ADMIN);
        setup_test(&mut scenario);

        let mut i = 0;
        // Simulate a user opening 30 boxes in a row
        while (i < 30) {
            let box = buy_box(&mut scenario);
            
            test_scenario::next_tx(&mut scenario, USER);
            let mut config = test_scenario::take_shared<GameConfig>(&scenario);
            let mut r = test_scenario::take_shared<Random>(&scenario);

            // Force the mock randomness to roll "Common" every time.
            random::update_randomness_state_for_testing(
                &mut r,
                i as u64,
                x"0000000000000000000000000000000000000000000000000000000000000000",
                test_scenario::ctx(&mut scenario)
            );

            loot_box::open_loot_box(&mut config, box, &r, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(config);
            test_scenario::return_shared(r);

            test_scenario::next_tx(&mut scenario, USER);
            let item = test_scenario::take_from_address<GameItem>(&scenario, USER);
            
            // Validate it actually gave a Common
            assert_eq(loot_box::get_rarity(&item), string::utf8(b"Common"));

            loot_box::burn_for_testing(item);
            i = i + 1;
        };

        // On the 31st open, the Pity System should intervene and guarantee a Legendary
        let final_box = buy_box(&mut scenario);

        test_scenario::next_tx(&mut scenario, USER);
        let mut config = test_scenario::take_shared<GameConfig>(&scenario);
        let mut r = test_scenario::take_shared<Random>(&scenario);

        // We use the EXACT same randomness (Zeros) that gave us Common 30 times.
        // But because fail_count >= 30, it should bypass standard roll and guarantee Legendary.
        random::update_randomness_state_for_testing(
            &mut r,
            30,
            x"0000000000000000000000000000000000000000000000000000000000000000",
            test_scenario::ctx(&mut scenario)
        );

        loot_box::open_loot_box(&mut config, final_box, &r, test_scenario::ctx(&mut scenario));
        
        test_scenario::return_shared(config);
        test_scenario::return_shared(r);

        test_scenario::next_tx(&mut scenario, USER);
        let legendary_item = test_scenario::take_from_address<GameItem>(&scenario, USER);
        
        // Assert pity system worked
        assert_eq(loot_box::get_rarity(&legendary_item), string::utf8(b"Legendary"));

        // Verify item stats
        let (name, rarity, power) = loot_box::get_item_stats(&legendary_item);
        assert_eq(name, string::utf8(b"Cyber-Vault Asset"));
        assert_eq(rarity, string::utf8(b"Legendary"));
        assert!(power >= 41 && power <= 50, 0);

        loot_box::burn_item(legendary_item);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_burn_and_transfer() {
        let mut scenario = test_scenario::begin(ADMIN);
        setup_test(&mut scenario);

        let box = buy_box(&mut scenario);

        // Open box
        test_scenario::next_tx(&mut scenario, USER);
        let mut config = test_scenario::take_shared<GameConfig>(&scenario);
        let mut r = test_scenario::take_shared<Random>(&scenario);
        random::update_randomness_state_for_testing(
            &mut r,
            1,
            x"0000000000000000000000000000000000000000000000000000000000000000",
            test_scenario::ctx(&mut scenario)
        );
        loot_box::open_loot_box(&mut config, box, &r, test_scenario::ctx(&mut scenario));
        test_scenario::return_shared(config);
        test_scenario::return_shared(r);

        // Transfer Phase
        test_scenario::next_tx(&mut scenario, USER);
        let item = test_scenario::take_from_address<GameItem>(&scenario, USER);
        
        // Transfer to USER2
        loot_box::transfer_item(item, USER2);

        // Verify USER2 received it and try burning
        test_scenario::next_tx(&mut scenario, USER2);
        let item_user2 = test_scenario::take_from_address<GameItem>(&scenario, USER2);
        
        // Ensure owner is USER2
        assert_eq(test_scenario::ctx(&mut scenario).sender(), USER2);

        // Verify stats on the transferred item
        let (_, rarity, _) = loot_box::get_item_stats(&item_user2);
        assert_eq(rarity, string::utf8(b"Common"));

        loot_box::burn_item(item_user2);
        test_scenario::end(scenario);
    }
}
