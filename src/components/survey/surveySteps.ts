
export const surveySteps = [
  {
    title: "Current State & Intentions",
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
      },
      {
        id: "motivation",
        label: "What brings you here today?",
        type: "textarea" as const
      }
    ]
  },
  {
    title: "Your Journey",
    fields: [
      {
        id: "journey_duration",
        label: "How long have you been on the SR/NoFap journey?",
        type: "textarea" as const
      },
      {
        id: "virginity_status",
        label: "Do you still have your V-card?",
        type: "radio" as const,
        options: ["Yes", "No", "Prefer not to say"]
      }
    ]
  },
  {
    title: "History & Goals",
    fields: [
      {
        id: "nsfw_start_age",
        label: "When did you first start consuming NSFW content?",
        type: "textarea" as const
      },
      {
        id: "longest_streak",
        label: "What has been your longest streak so far?",
        type: "textarea" as const
      },
      {
        id: "goal_frequency",
        label: "How often do you reach your streak goals?",
        type: "radio" as const,
        options: ["Frequently", "Sometimes", "Rarely"]
      }
    ]
  },
  {
    title: "Motivation & Challenges",
    fields: [
      {
        id: "motivation_factors",
        label: "What keeps you motivated to keep trying?",
        type: "textarea" as const
      },
      {
        id: "success_definition",
        label: "What would you consider a successful outcome from using this app?",
        type: "textarea" as const
      },
      {
        id: "biggest_challenge",
        label: "What is the most daunting aspect of SR/NoFap for you?",
        type: "textarea" as const
      },
      {
        id: "most_rewarding",
        label: "What is the most rewarding aspect of it?",
        type: "textarea" as const
      }
    ]
  }
];
