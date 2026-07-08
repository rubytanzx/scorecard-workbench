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
    id: "methods",
    label: "Learn the Methodology",
    prompts: [
      {
        label: "What does People Reached with Health, Nutrition and Population Services measure?",
        prompt: "What does People Reached with Health, Nutrition and Population Services measure?",
      },
      {
        label: "What is the relationship between the Scorecard Results Indicators, Client Context Indicators, and Outcome Areas?",
        prompt: "What is the relationship between Scorecard Results Indicators, Client Context Indicators, and Outcome Areas?",
      },
      {
        label: "How are Scorecard Indicators compiled?",
        prompt: "How are Scorecard Indicators compiled?",
      },
    ],
  },
  {
    id: "analytics",
    label: "Analyze the Results",
    prompts: [
      {
        label: "For the social safety net indicator, what explains the difference in results in FY25 compared to FY24?",
        prompt: "For the social safety net indicator, what explains the difference in results in FY25 compared to FY24?",
      },
      {
        label: "Which active portfolio projects in HNP did not contribute to a Scorecard indicator?",
        prompt: "Which active portfolio projects in HNP did not contribute to a Scorecard indicator?",
      },
      {
        label: "For the whole portfolio, what are the annual results for FY25?",
        prompt: "For the whole portfolio, what are the annual results for FY25?",
      },
      {
        label: "What explains the difference in results between FY24 and FY25?",
        prompt: "What explains the difference in results between FY24 and FY25?",
      },
      {
        label: "What is the performance of WBG / Region on different Scorecard indicators compared to other regions?",
        prompt: "What is the performance of South Asia on Scorecard indicators compared to other regions?",
      },
      {
        label: "Where are we now on a Scorecard Indicator, and where can we expect to be in the future?",
        prompt: "Where are we now on People Reached with Health, Nutrition and Population Services, and where can we expect to be in the future?",
      },
      {
        label: "What proportion of Scorecard results in IDA countries is being achieved with a donor country's money?",
        prompt: "What proportion of Scorecard results in IDA countries is being achieved with Norway's money?",
      },
      {
        label: "Can you show me results separately for IDA and IBRD countries, excluding projects funded by Trust Funds or IDA Grants?",
        prompt: "Can you show me results separately for IDA and IBRD countries, excluding trust funds or IDA grants?",
      },
      {
        label: "Build me a Scorecard for a set of indicators and countries.",
        prompt: "Can you build me a Scorecard for HNP, Education, and Social Protection indicators across Sub-Saharan Africa countries?",
      },
    ],
  },
  {
    id: "explore-scorecard",
    label: "Explore the Scorecard",
    prompts: [
      {
        label: "How can I use the Scorecard to inform the design of the CPF?",
        prompt: "How can I use the Scorecard to inform the design of the CPF?",
      },
      {
        label: "Are the results reaching the most vulnerable populations, and how does beneficiary geography compare to poverty geography?",
        prompt: "Are the results reaching the most vulnerable populations, and how does beneficiary geography compare to poverty geography?",
      },
      {
        label: "How can I use the Scorecard to inform the design of a project?",
        prompt: "How can I use the Scorecard to inform the design of a project in the Sahel?",
      },
      {
        label: "Where does the portfolio need to improve, and how should 'improvement' be defined?",
        prompt: "Where does the portfolio need to improve, and how should 'improvement' be defined?",
      },
      {
        label: "How does IDA21 address and report on a donor country's thematic priorities?",
        prompt: "How does IDA21 address and report on Japan's climate finance priorities?",
      },
      {
        label: "Create a report for donors of the MIGA Trust Fund on development outcomes based on Scorecard data.",
        prompt: "Create a report for donors of the MIGA Trust Fund on the development outcomes and impacts of MIGA's projects, based on Scorecard data.",
      },
      {
        label: "Can you show me outcomes by IDA financing window?",
        prompt: "Can you show me outcomes by IDA financing window (Global and Regional Opportunity, Scale-up, Crisis Response, Private Sector)?",
      },
    ],
  },
  {
    id: "narrative-builder",
    label: "Build a Narrative",
    prompts: [
      {
        label: "Build a narrative on results speaking to development issues in IBRD and middle-income countries.",
        prompt: "Can you build a narrative on results that speaks to development issues in IBRD and middle-income countries?",
      },
      {
        label: "What is the performance of the WBG on IDA21 policy commitments?",
        prompt: "What is the performance of the WBG on IDA21 policy commitments?",
      },
      {
        label: "How does IDA21 address and report on Japan's climate finance priorities?",
        prompt: "How does IDA21 address and report on Japan's climate finance priorities?",
      },
      {
        label: "How can I use the Scorecard to inform the design of a project in the Sahel?",
        prompt: "How can I use the Scorecard to inform the design of a project in the Sahel?",
      },
      {
        label: "Show progress on IDA focus areas — young people, crisis-readiness, WBG Gender Strategy.",
        prompt: "Can you show me progress on IDA focus areas that require disaggregation of headline Scorecard indicators — specifically services to young people, crisis-readiness in health, education, and social protection, and implementation of the WBG Gender Strategy?",
      },
    ],
  },
  {
    id: "narrative",
    label: "Build a Results Narrative",
    prompts: [],
  },
];
