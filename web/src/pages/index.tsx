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

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

type SubmitPaperData = {
  paperUrl: string;
  name: string;
  pagesToDelete?: number[];
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  const paperSubmitForm = useForm<z.infer<typeof submitPaperFormSchema>>({
    resolver: zodResolver(submitPaperFormSchema),
    defaultValues: {
      name: "Gorilla: Large Language Model Connected with Massive APIs",
      paperUrl: "https://arxiv.org/pdf/2305.15334.pdf",
      pagesToDelete: "10, 11, 12",
    },
  });

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
        {/* <Button>hello world</Button> */}
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
      </div>
    </div>
  );
}
