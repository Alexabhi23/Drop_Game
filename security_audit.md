# Security Audit: PTB Composition Attack Protection

**Feature Reviewed:** `gaming::loot_box::open_loot_box`

## Findings
The `open_loot_box` function is properly secured against **Programmable Transaction Block (PTB) Composition Attacks**.

### Explanation

In a PTB, a user can chain multiple Move calls together within a single transaction. If `open_loot_box` were implemented as a `public` function that returned a `GameItem` to the caller directly—instead of being an `entry` function—an attacker could execute a composition attack.

1. **The Vulnerability (If `public`)**:
   - The attacker creates a PTB that buys a loot box and calls `open_loot_box`.
   - The function returns the generated `GameItem` to the PTB context.
   - The attacker adds a subsequent command in the PTB to read the `GameItem`'s `rarity` field.
   - If the rarity is not "Legendary", the attacker intentionally causes the transaction to abort (e.g., using `assert!(is_legendary)` or forcing an execution failure).
   - Because the transaction aborts, all state changes are reverted. The attacker gets their SUI back and never loses funds on "failed" rolls. They can repeat this at minimal gas cost until they roll a Legendary.

2. **The Mitigation (Current `entry` Design)**:
   - By making `open_loot_box` an `entry` function, it *cannot* return the generated `GameItem` object back to the caller's PTB context.
   - Instead, the function itself explicitly transfers the `GameItem` to the user's address:
     ```move
     transfer::public_transfer(item, sender);
     ```
   - Because the object isn't returned to the PTB, the attacker cannot inspect the `rarity` within the same transaction to selectively abort.
   - They must commit to the transaction, pay the SUI, and receive the item in their wallet before they can inspect it, making the process secure and tamper-proof.

## Conclusion
The use of the `entry` keyword and direct `transfer::public_transfer` correctly isolates the randomness execution from caller-level assertions, effectively mitigating composition attacks and ensuring fairness.
