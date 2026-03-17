module gaming::loot_box {
    use sui::object::{self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{self, TxContext};
    use sui::coin::{self, Coin};
    use sui::sui::SUI;
    use sui::balance::{self, Balance};
    use sui::event;
    use sui::package;
    use sui::display;
    use sui::random::{self, Random};
    use sui::dynamic_field;
    use std::string::{self, String};

    /// Errors
    const EInsufficientPayment: u64 = 1;
    const EInvalidWeights: u64 = 2;
    const ETreasuryEmpty: u64 = 3;
    const ENotOwner: u64 = 4;

    /// Constants for Default Configuration
    const DEFAULT_COMMON_WEIGHT: u64 = 60;
    const DEFAULT_RARE_WEIGHT: u64 = 25;
    const DEFAULT_EPIC_WEIGHT: u64 = 12;
    const DEFAULT_LEGENDARY_WEIGHT: u64 = 3;
    const DEFAULT_PRICE: u64 = 10_000_000_000; // 10 SUI

    /// OTW for publisher
    public struct LOOT_BOX has drop {}

    /// Shared configuration object for the loot box system.
    public struct GameConfig has key {
        id: UID,
        /// Weights for rarity calculation [Common, Rare, Epic, Legendary] -> target sum: 100
        rarity_weights: vector<u64>,
        /// Cost of purchasing a single loot box in MIST (1 SUI = 1,000,000,000 MIST)
        price: u64,
        /// Holds the funds from loot box purchases
        treasury: Balance<SUI>,
    }

    /// Admin cap required to update config or withdraw funds.
    public struct AdminCap has key, store {
        id: UID,
    }

    /// The unopened Loot Box (Ticket).
    public struct LootBox has key, store {
        id: UID,
    }

    /// The resulting Game Item NFT.
    public struct GameItem has key, store {
        id: UID,
        name: String,
        rarity: String,
        power_level: u8,
    }

    /// Event emitted when a loot box is opened
    public struct LootBoxOpened has copy, drop {
        item_id: ID,
        rarity: String,
        power: u8,
        owner: address,
    }

    /// Initialize the module
    fun init(otw: LOOT_BOX, ctx: &mut TxContext) {
        // Setup Publisher
        let publisher = package::claim(otw, ctx);

        // Setup Sui Display standard for GameItem NFT
        let mut display = display::new_with_fields<GameItem>(
            &publisher,
            vector[
                string::utf8(b"name"),
                string::utf8(b"description"),
                string::utf8(b"rarity"),
                string::utf8(b"power_level"),
                string::utf8(b"image_url"),
                string::utf8(b"project_url"),
            ],
            vector[
                string::utf8(b"{name}"),
                string::utf8(b"A {rarity} tier gaming asset with power level {power_level}."),
                string::utf8(b"{rarity}"),
                string::utf8(b"{power_level}"),
                string::utf8(b"https://cybervault.game/api/image/{rarity}/{power_level}"),
                string::utf8(b"https://cybervault.game"),
            ],
            ctx
        );
        display::update_version(&mut display);

        // Transfer Publisher and Display standard to deployer
        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());

        // Mint and transfer Admin Cap to deployer
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::public_transfer(admin_cap, ctx.sender());

        // Initialize the game configuration
        init_game(DEFAULT_COMMON_WEIGHT, DEFAULT_RARE_WEIGHT, DEFAULT_EPIC_WEIGHT, DEFAULT_LEGENDARY_WEIGHT, DEFAULT_PRICE, ctx);
    }

    /// Creates shared `GameConfig` with rarity weights, price, and `AdminCap`.
    /// This can be used for explicit initialization or by `init`.
    public fun init_game(c_w: u64, r_w: u64, e_w: u64, l_w: u64, price: u64, ctx: &mut TxContext) {
        assert!(c_w + r_w + e_w + l_w == 100, EInvalidWeights);
        let game_config = GameConfig {
            id: object::new(ctx),
            rarity_weights: vector[c_w, r_w, e_w, l_w], 
            price, 
            treasury: balance::zero(),
        };
        transfer::share_object(game_config);
    }

    /// Buy a Loot Box and get the unopened ticket object
    entry fun purchase_loot_box(config: &mut GameConfig, mut payment: Coin<SUI>, ctx: &mut TxContext) {
        assert!(payment.value() >= config.price, EInsufficientPayment);
        
        let paid = payment.split(config.price, ctx);
        config.treasury.join(paid.into_balance());
        
        // Return change if any
        if (payment.value() > 0) {
            transfer::public_transfer(payment, ctx.sender());
        } else {
            payment.destroy_zero();
        };

        // Mint LootBox to buyer
        let loot_box = LootBox {
            id: object::new(ctx),
        };
        transfer::public_transfer(loot_box, ctx.sender());
    }

    /// Open a Loot Box.
    /// Needs to be an entry function so returning GameItem or Box is not possible directly,
    /// avoiding PTB Composition attacks. Transfers NFT automatically.
    entry fun open_loot_box(config: &mut GameConfig, box: LootBox, r: &Random, ctx: &mut TxContext) {
        // Destroy the unopened ticket
        let LootBox { id: box_id } = box;
        object::delete(box_id);

        let sender = ctx.sender();

        // Check the dynamic_field pity counter
        let mut fail_count = 0;
        if (dynamic_field::exists_(&config.id, sender)) {
            fail_count = *dynamic_field::borrow<address, u64>(&config.id, sender);
        };

        let is_pity = fail_count >= 30;

        let mut gen = random::new_generator(r, ctx);

        let rarity: String;
        let power_level: u8;

        if (is_pity) {
            // Guaranteed Legendary
            rarity = string::utf8(b"Legendary");
            power_level = random::generate_u8_in_range(&mut gen, 41, 50);
            
            // Reset fail count and provide storage rebate
            if (dynamic_field::exists_(&config.id, sender)) {
                dynamic_field::remove<address, u64>(&mut config.id, sender);
            };
        } else {
            // Standard roll based on weights
            let roll = random::generate_u8_in_range(&mut gen, 0, 99);
            
            let common_wt = config.rarity_weights[0] as u8;
            let rare_wt = config.rarity_weights[1] as u8;
            let epic_wt = config.rarity_weights[2] as u8;

            if (roll < common_wt) {
                rarity = string::utf8(b"Common");
                power_level = random::generate_u8_in_range(&mut gen, 1, 10);
                increment_fail_count(config, sender);
            } else if (roll < common_wt + rare_wt) {
                rarity = string::utf8(b"Rare");
                power_level = random::generate_u8_in_range(&mut gen, 11, 25);
                increment_fail_count(config, sender);
            } else if (roll < common_wt + rare_wt + epic_wt) {
                rarity = string::utf8(b"Epic");
                power_level = random::generate_u8_in_range(&mut gen, 26, 40);
                increment_fail_count(config, sender);
            } else {
                rarity = string::utf8(b"Legendary");
                power_level = random::generate_u8_in_range(&mut gen, 41, 50);
                
                // Got legendary organically, reset fail count and provide storage rebate
                if (dynamic_field::exists_(&config.id, sender)) {
                    dynamic_field::remove<address, u64>(&mut config.id, sender);
                };
            };
        };

        let item = GameItem {
            id: object::new(ctx),
            name: string::utf8(b"Cyber-Vault Asset"),
            rarity,
            power_level,
        };

        // Emit the event for off-chain indexing (UI listening)
        event::emit(LootBoxOpened {
            item_id: object::id(&item),
            rarity,
            power: power_level,
            owner: sender,
        });

        // Send asset securely to the caller
        transfer::public_transfer(item, sender);
    }

    /// View function returning name, rarity tier, power level
    public fun get_item_stats(item: &GameItem): (String, String, u8) {
        (item.name, item.rarity, item.power_level)
    }

    /// Owner transfers GameItem to another address
    entry fun transfer_item(item: GameItem, recipient: address) {
        transfer::public_transfer(item, recipient);
    }

    /// Owner destroys GameItem
    entry fun burn_item(item: GameItem) {
        let GameItem { id, name: _, rarity: _, power_level: _ } = item;
        object::delete(id);
    }

    /// Internal helper method to bump fail_count safely
    fun increment_fail_count(config: &mut GameConfig, user: address) {
        if (dynamic_field::exists_(&config.id, user)) {
            let count_ref = dynamic_field::borrow_mut<address, u64>(&mut config.id, user);
            *count_ref = *count_ref + 1;
        } else {
            dynamic_field::add(&mut config.id, user, 1u64);
        }
    }


    // --- Admin Operations ---

    /// Update the rarity distribution weights
    entry fun update_rarity_weights(_cap: &AdminCap, config: &mut GameConfig, c_w: u64, r_w: u64, e_w: u64, l_w: u64) {
        assert!(c_w + r_w + e_w + l_w == 100, EInvalidWeights);
        config.rarity_weights = vector[c_w, r_w, e_w, l_w];
    }

    /// Withdraw SUI from treasury
    entry fun withdraw_funds(_cap: &AdminCap, config: &mut GameConfig, amount: u64, ctx: &mut TxContext) {
        assert!(config.treasury.value() >= amount, ETreasuryEmpty);
        let coin = coin::from_balance(config.treasury.split(amount), ctx);
        transfer::public_transfer(coin, ctx.sender());
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(LOOT_BOX {}, ctx);
    }

    #[test_only]
    public fun burn_for_testing(item: GameItem) {
        let GameItem { id, name: _, rarity: _, power_level: _ } = item;
        object::delete(id);
    }

    #[test_only]
    public fun get_rarity_weights(config: &GameConfig): vector<u64> {
        config.rarity_weights
    }

    #[test_only]
    public fun get_price(config: &GameConfig): u64 {
        config.price
    }

    #[test_only]
    public fun is_legendary(item: &GameItem): bool {
        item.rarity == std::string::utf8(b"Legendary")
    }

    #[test_only]
    public fun get_rarity(item: &GameItem): std::string::String {
        item.rarity
    }
}
