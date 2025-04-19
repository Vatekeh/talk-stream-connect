
export const surveySteps = [
  {
    title: "Current State",
    fields: [
      {
        id: "feeling",
        label: "How are you feeling today?",
        type: "radio" as const,
        options: [
          "Energized and focused",
          "Okay, but could be better",
          "Struggling or feeling low",
          "Prefer not to say"
        ]
      }
    ]
  },
  {
    title: "Your Intention",
    fields: [
      {
        id: "motivation",
        label: "What brings you here today?",
        type: "textarea" as const
      }
    ]
  },
  {
    title: "Journey Duration",
    fields: [
      {
        id: "journey_duration",
        label: "How long have you been on the SR/NoFap journey?",
        type: "radio" as const,
        options: [
          "< 1 year",
          "1-2 years",
          "3-5 years",
          "+5 years"
        ]
      }
    ]
  },
  {
    title: "Personal Status",
    fields: [
      {
        id: "virginity_status",
        label: "Do you still have your V-card?",
        type: "radio" as const,
        options: ["Yes", "No", "Prefer not to say"]
      }
    ]
  },
  {
    title: "History",
    fields: [
      {
        id: "nsfw_start_age",
        label: "When did you first start consuming NSFW content?",
        type: "radio" as const,
        options: [
          "Under 13 years old",
          "13-15 years old",
          "16-18 years old",
          "18+ years old"
        ]
      }
    ]
  },
  {
    title: "Current Progress",
    fields: [
      {
        id: "longest_streak",
        label: "What has been your longest streak so far?",
        type: "radio" as const,
        options: [
          "Less than a week",
          "Less than two weeks",
          "Less than a month",
          "Less than 3 months",
          "More than 3 months"
        ]
      }
    ]
  },
  {
    title: "Goal Setting",
    fields: [
      {
        id: "goal_frequency",
        label: "How often do you reach your streak goals?",
        type: "radio" as const,
        options: ["Frequently", "Sometimes", "Rarely"]
      }
    ]
  },
  {
    title: "Future Goals",
    fields: [
      {
        id: "future_goal_significance",
        label: "What would reaching a one-year streak mean to you?",
        type: "textarea" as const
      }
    ]
  },
  {
    title: "Motivation",
    fields: [
      {
        id: "motivation_factors",
        label: "What keeps you motivated to keep trying?",
        type: "textarea" as const
      }
    ]
  },
  {
    title: "Challenges",
    fields: [
      {
        id: "biggest_challenge",
        label: "What is the most daunting aspect of SR/NoFap for you?",
        type: "textarea" as const
      }
    ]
  },
  {
    title: "Rewards",
    fields: [
      {
        id: "most_rewarding",
        label: "What is the most rewarding aspect of it?",
        type: "textarea" as const
      }
    ]
  }
];
