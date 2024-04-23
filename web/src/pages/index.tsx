"use client";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Form, // https://github.com/shadcn-ui/ui/issues/800 (make sure to import form correctly)
} from "@/components/ui/form";
// upgrade zod by `yarn add zod@3.22.4`
// add `yarn add @radix-ui/react-collapsible` to fix the Can't resolve '@radix-ui/react-collapsible' error

// 2. display the notes
// 3. get the question and answer displayed on the side too

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { z } from "zod";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { ArxivPaperNote } from "./api/take_notes";
import { QaResponse } from "./api/qa";

const questionFormSchema = z.object({
  question: z.string().min(1, {
    message: "question must be at least 1 character",
  }),
});

type SubmitPaperData = {
  paperUrl: string;
  name: string;
  pagesToDelete?: number[];
};

type Answers = {
  answer: string;
  followUpQuestions: string[];
};

const submitPaperFormSchema = z.object({
  paperUrl: z.string(),
  name: z.string(),
  pagesToDelete: z.string().optional(),
});

const processPagesToDelete = (pagesToDelete: string): number[] =>
  pagesToDelete.split(",").map(Number);

export default function Home() {
  const [submittedPaperData, setSubmittedPaperData] = useState<
    SubmitPaperData | undefined
  >();
  const [notes, setNotes] = useState<Array<ArxivPaperNote>>();
  const [answers, setAnswers] = useState<Array<QaResponse>>();

  const paperSubmitForm = useForm<z.infer<typeof submitPaperFormSchema>>({
    resolver: zodResolver(submitPaperFormSchema),
    defaultValues: {
      name: "Gorilla: Large Language Model Connected with Massive APIs",
      paperUrl: "https://arxiv.org/pdf/2305.15334.pdf",
      pagesToDelete: "10, 11, 12",
    },
  });

  const questionForm = useForm<z.infer<typeof questionFormSchema>>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      question: "why is the sky blue?",
    },
  });

  async function onQuestionSubmit(values: z.infer<typeof questionFormSchema>) {
    if (!submittedPaperData) {
      throw new Error("no paper submitted");
    }

    const data = {
      ...values,
      paperUrl: submittedPaperData.paperUrl,
    };

    console.log(values);
    // what do i have to do here?
    // 0. check that there is a submitted question
    // 0.1 construct a data object
    // 1. set the questionData
    // 2. fetch(api/qa)
    // 3. values needs to have the question and the paper for the backend

    const response = await fetch("/api/qa", {
      method: "post",
      body: JSON.stringify(data),
    }).then((res) => {
      if (res.ok) {
        return res.json();
      }
      return null;
    });

    if (response) {
      console.log(response);
      setAnswers(response);
      console.log(answers, "answers");
      return;
    } else {
      throw new Error("something went wrong getting answers");
    }
  }

  async function paperSubmit(values: z.infer<typeof submitPaperFormSchema>) {
    // 1. check that values are the correct type
    // 1.1 convert values.pagesToDelete to an array of numbers
    // 2. pass it to my backend which would be /api/take_notes
    // 3. check that it exists in my datase
    // 4. save the reponse to my state
    console.log(values);
    setSubmittedPaperData({
      ...values,
      pagesToDelete: values.pagesToDelete
        ? processPagesToDelete(values.pagesToDelete)
        : undefined,
    });

    const response = await fetch("/api/take_notes", {
      method: "post",
      body: JSON.stringify(values),
    }).then((res) => {
      if (res.ok) {
        return res.json();
      }
      return "a";
    });

    if (response) {
      console.log(response);
      setNotes(response);
    } else {
      throw new Error("error while taking notes");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row gap-5 mx-auto mt-5">
        <div className="flex flex-col border-2 border-gray-200 rounded-md p-2">
          <div>
            <h1>Input your favorite paper</h1>
            <div />
            <Form {...paperSubmitForm}>
              <form
                onSubmit={paperSubmitForm.handleSubmit(paperSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={paperSubmitForm.control}
                  name="paperUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paper Url</FormLabel>
                      <FormControl>
                        <Input placeholder="shadcn" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is your public display name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={paperSubmitForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="shadcn" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is your public display name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <p className="font-normal"> Delete pages?</p>
                      <ChevronsUpDown className="h-4 w-4" />
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <FormField
                      control={paperSubmitForm.control}
                      name="paperUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pages To Delete</FormLabel>
                          <FormControl>
                            <Input placeholder="10, 11, 12" {...field} />
                          </FormControl>
                          <FormDescription>Pages to delete</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CollapsibleContent>
                </Collapsible>

                <Button type="submit">Submit</Button>
              </form>
            </Form>
          </div>
        </div>

        <div className="flex flex-col border-2 border-gray-200 rounded-md p-2">
          <Form {...questionForm}>
            <form
              onSubmit={questionForm.handleSubmit(onQuestionSubmit)}
              className="space-y-8"
            >
              <FormField
                control={questionForm.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question</FormLabel>
                    <FormControl>
                      <Input placeholder="what's your question" {...field} />
                    </FormControl>
                    <FormDescription>
                      Input your question for this paper
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </div>
      </div>
      <div className="flex flex-row gap-5 mx-auto mt-3">
        {notes && notes.length > 0 && (
          <div>
            <h2>Notes</h2>
            <div className="flex flex-col gap-2">
              {notes.map((note, index) => (
                <div key={index} className="flex flex-col gap-2 p-2">
                  <p>
                    {index + 1}. {note.note}
                  </p>
                  <p className="text-sm text-gray-600">
                    [{note.pageNumbers.join(",")}]
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {answers && answers.length > 0 && (
          <div className="flex flex-col gap-2 max-w-[600px]">
            <h2>Answers</h2>
            <div className="flex flex-col gap-2">
              {answers.map((answer, index) => (
                <div key={index} className="flex flex-col gap-1 p-3">
                  <p>
                    {index + 1}. {answer.answer}
                  </p>
                  <p>Follow up questions:</p>
                  <div className="flex flex-col gap-2 p-2">
                    {answer.followupQuestions.map((followup, followupIndex) => (
                      <p key={followupIndex} className="text-sm gray-400">
                        {followup}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
