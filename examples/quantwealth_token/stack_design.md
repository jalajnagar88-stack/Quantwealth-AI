# Stack Design — QuantWealth Token (QWT)

## Asset Configuration

- **Asset Type**: FT (Fungible Token)
- **Total Supply**: 1,000,000 QWT
- **Decimals**: 18
- **Unit Name**: tokens

## Stack Configuration

- **Total HACD Lots**: 100
- **HACD per Lot**: 1
- **Units per HACD Lot**: 10,000 QWT
- **Stack Cost**: 50 HAC per HACD
- **First Phase Lots**: 20 (designated)
- **Public Phase Lots**: 80 (public sale)
- **Removal Effect**: Burn Asset

## Math Verification

### Supply Equation
```
total_supply = total_hacd_lots × units_per_hacd_lot
1,000,000 = 100 × 10,000
✓ Verified
```

### Formation Cost
```
formation_cost_hac = total_hacd_lots × stack_cost_hac_per_hacd
formation_cost_hac = 100 × 50 = 5,000 HAC
```

### Phase Distribution
```
first_phase_hacd_lots + public_phase_hacd_lots = total_hacd_lots
20 + 80 = 100
✓ Verified
```

### Minimum Backing Reference
```
minimum_backing_reference = 1 HACD + 50 HAC + network_fee
≈ 51 HAC + network_fee
```

## Phase Model

### Phase 1: Designated (20 lots)
- **Lots**: 20 HACD lots
- **Units**: 200,000 QWT (20% of supply)
- **Participants**: Early supporters, team, advisors
- **Formation Cost**: 1,000 HAC (20 × 50)

### Phase 2: Public Sale (80 lots)
- **Lots**: 80 HACD lots
- **Units**: 800,000 QWT (80% of supply)
- **Participants**: Open to all HACD holders
- **Formation Cost**: 4,000 HAC (80 × 50)

## Stack Cost Justification

The stack cost of 50 HAC per HACD falls within the **Mid/Community** tier (50-100 HAC per HACD), which is appropriate for:
- Community-focused projects
- Moderate participation goals
- Balance between accessibility and commitment

**Comparison to benchmarks**:
- Carat Protocol: 100 HAC per HACD (premium tier)
- QuantWealth Token: 50 HAC per HACD (mid tier)
- Low participation tier: 10-50 HAC per HACD

## Removal Effect

When a Stack is removed:
- The HACD is released back to the holder
- The QWT tokens are burned (permanently removed from supply)
- This creates deflationary pressure and aligns holder incentives

## Formation Reference

The formation cost of 50 HAC per HACD serves as a **formation reference** or **cost basis reference**. This is the on-chain cost to form the Stack, but it is **not a guaranteed floor price**. Market dynamics, utility, and adoption will determine the actual trading price.

## HYBRID Structure Notes

N/A — QWT is a pure FT (Fungible Token). No HYBRID structure required.
