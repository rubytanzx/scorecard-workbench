# Common Pandas Patterns

```python
import pandas as pd

# --- Results file: Schema A (example: HNP Services = CSC_RES_HEA_SERV.xlsx) ---
df = pd.read_excel('CSC_RES_HEA_SERV.xlsx', sheet_name='Aggregates')

# Global WBG headline, FY25
total = df[
    (df['Organization_Code'] == 'WBG') &
    (df['Geography_Type'] == 'GLOBAL') &
    (df['Demographic_Disaggregation'] == 'Total') &
    (df['Time_Period'] == pd.Timestamp('2025-06-30'))
]['Achieved_Results'].sum()

# IDA country breakdown, FY25, no double-counting
proj = pd.read_excel('CSC_RES_HEA_SERV.xlsx', sheet_name='WB Project Information')
fcs = proj[
    (proj['FCV_Flag'] == 'Y') &
    (proj['Double_Counting_Flag'] != 'Y') &
    (proj['Reporting_FY'] == 2025)
]

# --- Context/Vision file: Schema B (example: Electricity Access Context = EG_ELC_ACCS_ZS.xlsx) ---
ctx = pd.read_excel('EG_ELC_ACCS_ZS.xlsx', sheet_name='Aggregates')

# Country rows use Geography_Type == 'ECONOMY'; data column is 'Value'
latest = (
    ctx[ctx['Geography_Type'] == 'ECONOMY']
    .sort_values('Time_Period', ascending=False)
    .groupby('Geography_Code')
    .first()
    .reset_index()
)

# --- Social Protection Coverage (PER_ALLSP_COV_POP_TO.xlsx): two sub-indicators in one file ---
sp = pd.read_excel('PER_ALLSP_COV_POP_TO.xlsx', sheet_name='Aggregates')
total_pop = sp[sp['Indicator_Code'] == 'PER_ALLSP_COV_POP_TOT']   # all population
poorest_q1 = sp[sp['Indicator_Code'] == 'PER_ALLSP_COV_Q1_TOT']   # poorest quintile

# --- Food insecurity: pick the right file by Indicator_Type ---
# "Food Insecurity Client Context" = SN_ITK_MSFI_ZS_CC.xlsx  (country-level, Client Context)
# "Food Insecurity Vision"         = SN_ITK_MSFI_ZS.xlsx     (global/regional, Vision)
```
