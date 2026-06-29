# XLSX Schemas

There are two distinct XLSX schemas. Never mix them.

## Schema A — Results files: `CSC_RES_*.xlsx`

Sheets:

- `Aggregates`
- `WB Project Information`
- `IFC MIGA Results`
- `Dictionary`

### Aggregates columns

```text
Indicator_Code, Indicator_Name, Sub_Indicator_Code
Organization_Code           # WBG | WB | IDA | IBRD | IFC | MIGA
Indicator_Type              # always "WBG Results"
Geography_Type              # GLOBAL | REGION | COUNTRY | INCOME_GROUP | SMALLSTATE
Geography_Code, Geography_Name
Demographic_Disaggregation  # Total | Female | Youth | Yes (disability)
Time_Period                 # YYYY-MM-DD, e.g. 2025-06-30
Unit_Measure                # Beneficiaries | USD | GW | Hectares | Percentage
Achieved_Results            # key data column
Expected_Results            # key data column
Disability_Inclusive_Flag, Observation_Note
```

### WB Project Information key columns

```text
Project_ID, Project_Name, Approval_Date, Closing_Date
WB_Region, CountryEconomy_Code, CountryEconomy_Name
Lending_Instrument, Project_Financier, Agreement_Type
Net_Commitment_Total, Net_Commitment_IBRD, Net_Commitment_IDA, Net_Commitment_Others
indicator_code, sub_indicator_code, Reporting_FY
Achieved_Results, Expected_Results
Achieved_Results_IDA, Expected_Results_IDA
Achieved_Results_IBRD, Expected_Results_IBRD
Demographic_Disaggregation
Double_Counting_Flag        # Y | N — exclude Y when summing across indicators
FCV_Flag                    # Y | N — primary FCS filter
Small_State_Flag, SIDS_Flag, LDC_Flag
Income_Group                # LIC | LMC | UMC | HIC
```

IFC/MIGA results are aggregate only. There are no project rows due to data privacy policy.

## Schema B — Context and Vision files

All non-Results XLSX files use Schema B.

Sheets:

- `Aggregates`
- `Dictionary`

```text
Indicator_Code, Indicator_Name
Indicator_Type              # "Client Context" or "Vision"
Geography_Type              # ECONOMY | REGION | FCS | INCOME | SIDS | LDC | SMALLSTATE
Geography_Code, Geography_Name
Time_Period                 # year as integer or date — varies by file
Unit_Multiplier, Unit_Measure_Code, Unit_Measure_Name
Value                       # key data column
Observation_Status_Code     # A = normal value
Observation_Status_Name, Observation_Note
```

## Key differences

- Schema A uses `Achieved_Results` and `Expected_Results`; Schema B uses `Value`.
- Schema A has `Organization_Code`; Schema B does not.
- Schema A has `Demographic_Disaggregation`; Schema B does not.
- Country rows are `COUNTRY` in Results files, but `ECONOMY` in Context/Vision files.
- Schema A may include project-level sheets. Schema B does not.
- Schema B is usually a multi-year time series panel.
