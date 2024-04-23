import type { NextApiRequest, NextApiResponse } from "next";

export type ArxivPaperNote = {
  note: string;
  pageNumbers: number[];
};

const hardcodedNote: ArxivPaperNote[] = [
  {
    note: "Strategic reasoning involves understanding and predicting adversary actions in multi-agent settings while adjusting strategies accordingly.",
    pageNumbers: [1],
  },
  {
    note: "Strategic reasoning challenges are highly relevant to real-world issues, including business analysis and policy making.",
    pageNumbers: [1],
  },
  {
    note: "Large Language Models (LLMs) have ushered in a new era in artificial intelligence, highlighting potential in reasoning tasks like common sense question answering and mathematical problems.",
    pageNumbers: [1],
  },
  {
    note: "Strategic reasoning differentiates itself by the dynamism of the reasoning environment and the uncertainty of adversary actions.",
    pageNumbers: [1],
  },
  {
    note: "LLMs facilitate a wider range of strategic applications through dialogue-based generative agents and powerful contextual understanding capabilities.",
    pageNumbers: [1],
  },
  {
    note: "Interdisciplinary approaches like theory of mind and cognitive hierarchy are being adapted to enhance decision-making performance of LLMs in strategic reasoning.",
    pageNumbers: [1],
  },
  {
    note: "There is a notable absence of a systematic review on the use of LLMs in strategic reasoning, highlighting the need for a comprehensive overview.",
    pageNumbers: [1],
  },
  {
    note: "Strategic reasoning involves anticipating and influencing the actions of others in a competitive or cooperative multi-agent setting.",
    pageNumbers: [1],
  },
  {
    note: "Strategic reasoning requires understanding motives, intentions, and potential actions of others, as well as causal relationships within the environment.",
    pageNumbers: [1],
  },
  {
    note: "LLMs demonstrate the capability to analyze and participate in economic systems, showcasing strategic thinking in monetary and business environments.",
    pageNumbers: [1],
  },
  {
    note: "In the context of gaming, LLMs are critical for understanding game mechanics, developing winning strategies, and adapting to opponents' tactics.",
    pageNumbers: [1],
  },
  {
    note: "Methods like Prompt Engineering, Module Enhancement, Theory of Mind, and Imitation Learning are employed to enhance the performance of LLMs in strategic reasoning.",
    pageNumbers: [1],
  },
  {
    note: "Evaluation in strategic reasoning includes measuring outcomes in controlled environments, utilizing performance metrics like win rates, survival rates, and rewards.",
    pageNumbers: [1],
  },
  {
    note: "Qualitative evaluation focuses on understanding underlying mechanics of strategic reasoning, including deception, cooperation, and discernment.",
    pageNumbers: [1],
  },
  {
    note: "Strategic reasoning presents a unique challenge for LLMs, which excel in generating coherent language and leveraging extensive knowledge.",
    pageNumbers: [1],
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Array<ArxivPaperNote> | undefined>
) {
  // 1. define API URL
  // 2. fetch the api with a post request, pass in headers, and body
  // 3. check the response with (res.ok)
  // 4. return res.json()
  // 5. if there's data, send back res.status(200).json(data)
  // 6. otherwsie return res(400)

  const API_URL = "localhost:8000/take_notes";
  // const data = await fetch(API_URL, {
  //   method: "post",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: req.body,
  // }).then((res) => {
  //   if (res.ok) {
  //     return res.json();
  //   }
  //   return null;
  // });

  // if (data) {
  //   return res.status(200).json(data);
  // }
  // return res.status(400);
  return res.status(200).json(hardcodedNote);
}
