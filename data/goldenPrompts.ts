export interface GoldenPrompt {
  label: string;
  prompt: string;
}

export interface ActionMenu {
  id: string;
  label: string;
  prompts: GoldenPrompt[];
}

export const ACTION_MENUS: ActionMenu[] = [
  {
    id: "explore",
    label: "Explore the Scorecard",
    prompts: [
      {
        label: "What does the People Reached with Health Services indicator measure?",
        prompt: "What does the People Reached with Health Services indicator measure?",
      },
      {
        label: "What is the relationship between Results Indicators, Client Context Indicators, and Outcome Areas?",
        prompt: "What is the relationship between the Scorecard Results Indicators, Client Context Indicators, and Outcome Areas?",
      },
      {
        label: "How are Scorecard Indicators compiled?",
        prompt: "How are Scorecard Indicators compiled?",
      },
      {
        label: "What are the annual results for FY25 across the whole portfolio?",
        prompt: "For the whole portfolio, what are the annual results for FY25?",
      },
      {
        label: "Build me a Scorecard for health and education indicators across IDA countries in Africa.",
        prompt: "Build me a Scorecard for health and education indicators across IDA countries in Africa.",
      },
    ],
  },
  {
    id: "analyse",
    label: "Analyse",
    prompts: [
      {
        label: "What explains the difference in results between FY24 and FY25?",
        prompt: "What explains the difference in results between FY24 and FY25?",
      },
      {
        label: "What explains the FY24–FY25 results difference for Sub-Saharan Africa?",
        prompt: "What explains the difference in results between FY24 and FY25 for Sub-Saharan Africa?",
      },
      {
        label: "Where does the portfolio need to improve, and how should improvement be defined?",
        prompt: "Where does the portfolio need to improve, and how should improvement be defined?",
      },
      {
        label: "How does South Asia perform on Scorecard indicators compared to other regions?",
        prompt: "What is the performance of South Asia on different Scorecard indicators compared to other regions?",
      },
      {
        label: "Where are we now on climate resilience, and where can we expect to be in the future?",
        prompt: "Where are we now on climate resilience, and where can we expect to be in the future?",
      },
      {
        label: "Are results reaching the most vulnerable populations?",
        prompt: "Are the results reaching the most vulnerable populations, and how does the geographic location of beneficiaries compare to the location of the poor?",
      },
      {
        label: "What proportion of IDA results is being achieved with Japan's money?",
        prompt: "What proportion of Scorecard results in IDA countries is being achieved with Japan's money?",
      },
      {
        label: "Show me outcomes by IDA financing window.",
        prompt: "Can you show me outcomes by IDA financing window?",
      },
      {
        label: "Show results separately for IDA and IBRD countries, excluding trust fund projects.",
        prompt: "Can you show me results separately for IDA and IBRD countries, excluding projects funded by trust funds or IDA grants?",
      },
      {
        label: "Are WBG Scorecard data comparable to impact investor data such as IRIS+?",
        prompt: "Are WBG Scorecard data comparable to impact investor data from other organizations, such as IRIS+?",
      },
    ],
  },
  {
    id: "explain",
    label: "Explain Contributions",
    prompts: [
      {
        label: "Which active HNP projects did not contribute to Scorecard indicators?",
        prompt: "Which active portfolio projects in HNP did not contribute to Scorecard indicators?",
      },
      {
        label: "How does IDA21 address and report on Japan's thematic priorities?",
        prompt: "How does IDA21 address and report on Japan's thematic priorities?",
      },
      {
        label: "Show progress on services to young people, crisis-readiness, and the WBG Gender Strategy.",
        prompt: "Can you show me progress on IDA focus areas that require disaggregation of headline Scorecard indicators — specifically services to young people, crisis-readiness in health, education, and social protection, and implementation of the WBG Gender Strategy?",
      },
      {
        label: "Explain how IFC works with IDA/IBRD to create markets.",
        prompt: "Can you explain how IFC works with IDA/IBRD to create markets, including through the enabling environment?",
      },
      {
        label: "Create a donor report for the MIGA Trust Fund based on Scorecard data.",
        prompt: "Create a report for donors of the MIGA Trust Fund on the development outcomes and impacts of MIGA's projects, based on Scorecard data.",
      },
    ],
  },
  {
    id: "narrative",
    label: "Draft a Report",
    prompts: [
      {
        label: "How can I build a narrative on results that speaks to development issues in IBRD and middle-income countries?",
        prompt: "How can I build a narrative on results that speaks to development issues in IBRD and middle-income countries?",
      },
      {
        label: "How does IDA21 address and report on Norway's food security priorities?",
        prompt: "How does IDA21 address and report on Norway's food security priorities?",
      },
      {
        label: "What is the performance of the WBG on IDA21 policy commitments?",
        prompt: "What is the performance of the WBG on IDA21 policy commitments?",
      },
    ],
  },
];
