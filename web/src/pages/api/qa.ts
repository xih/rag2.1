import { NextApiRequest, NextApiResponse } from "next";

export type QaResponse = {
  answer: string;
  followupQuestions: string[];
};

const hardcodedAnswer = [
  {
    answer:
      "The emotion features in irony detection include sentiment analysis, emotion classification, and sarcasm detection. These features help in identifying the underlying emotions and intentions behind ironic statements.",
    followupQuestions: [
      "How do sentiment analysis techniques contribute to irony detection?",
      "What are the challenges in accurately classifying emotions in ironic statements?",
      "How can sarcasm detection algorithms be improved for better irony detection?",
    ],
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<QaResponse[] | undefined>
) {
  return res.status(200).send(hardcodedAnswer);
  // const API_URL = "localhost:8000/qa";

  // const data = await fetch(API_URL, {
  //   method: "post",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: req.body,
  // }).then((res) => {
  //   if (res.ok) {
  //     console.log(res, "what is res on QaResponse");
  //     return res.json();
  //   }
  //   return undefined;
  // });

  // if (data) {
  //   return res.status(200).send(data);
  // } else {
  //   return res.status(400);
  // }
}
