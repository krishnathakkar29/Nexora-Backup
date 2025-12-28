"use client";
import { sendMailSingle } from "@/actions/mailActions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { fetchAPI } from "@/lib/fetch-api";
import { sendEmailSchema } from "@/schema/mail";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import MDEditor from "@uiw/react-md-editor";
import {
  Building2,
  Key,
  Loader2,
  Mail,
  Paperclip,
  Send,
  Users,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

function page() {
  const [files, setFiles] = useState<File[]>([]);
  const [isMarkdown, setIsMarkdown] = useState(false);

  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof sendEmailSchema>>({
    resolver: zodResolver(sendEmailSchema),
    defaultValues: {
      recipients: [{ email: "" }],
      subject: "",
      platform: "",
      companyName: "",
      body: "",
      apppassword: "",
      appusername: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "recipients",
    control: form.control,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/msword": [".doc", ".docx"],
    },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const { mutate: sendEmailMutation, isPending } = useMutation({
    mutationFn: async (data: any) => {
      try {
        const formData = new FormData();
        data.recipients.forEach((recipient: { email: string }) => {
          formData.append("recipients", recipient.email);
        });

        const formattedBody = data.body.replace(/\n/g, "<br>");
        formData.append("subject", data.subject);
        formData.append("platform", data.platform);
        formData.append("companyName", data.companyName);
        formData.append("appUsername", data.appusername);
        formData.append("appPassword", data.apppassword);
        formData.append("body", formattedBody);

        files.forEach((file) => {
          formData.append("files", file);
        });

        const response = await sendMailSingle(formData);

        if (!response.success) {
          toast.error(response.message);
          return;
        }

        return response;
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["mail-history"] });
      toast.success(data.message);
    },
    onError: (error: any) => {
      console.error("Error sending email:", error);
      toast.error(error.message || "Failed to send email");
    },
  });

  const onSubmit = async (data: any) => {
    sendEmailMutation(data);
  };
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in-50 duration-500">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-blue-500 to-cyan-500 rounded-2xl mb-6 shadow-lg shadow-blue-500/25">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Compose Email</h1>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Create and send professional emails with attachments
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-1 space-y-6">
                {/* Recipients Section */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 space-y-4 border border-slate-700/50 shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
                        <Users className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-white">
                          Recipients
                        </h2>
                        <p className="text-xs text-slate-400">
                          Add email recipients
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <FormField
                        key={field.id}
                        control={form.control}
                        name={`recipients.${index}.email`}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center space-x-2">
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="email@example.com"
                                  type="email"
                                  className="bg-slate-900/50 border-slate-700 focus:border-cyan-500 transition-colors"
                                />
                              </FormControl>
                              {fields.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => remove(index)}
                                  className="hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ email: "" })}
                      className="w-full border-slate-700 hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
                    >
                      + Add Recipient
                    </Button>
                  </div>
                </div>

                {/* Email Details */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 space-y-4 border border-slate-700/50 shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
                      <Building2 className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        Email Details
                      </h2>
                      <p className="text-xs text-slate-400">
                        Company information
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">
                            Company Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter company name"
                              className="bg-slate-900/50 border-slate-700 focus:border-cyan-500 transition-colors"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="platform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">
                            Platform
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter the platform"
                              className="bg-slate-900/50 border-slate-700 focus:border-cyan-500 transition-colors"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Authentication Section */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 space-y-4 border border-slate-700/50 shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
                      <Key className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        Gmail SMTP Credentials
                      </h2>
                      <p className="text-xs text-slate-400">
                        Enter your Gmail SMTP credentials to send emails
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="appusername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">
                            App Username
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter App Username"
                              className="bg-slate-900/50 border-slate-700 focus:border-cyan-500 transition-colors"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="apppassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">
                            App Password
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Enter App Password"
                              className="bg-slate-900/50 border-slate-700 focus:border-cyan-500 transition-colors"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6 lg:col-span-2">
                {/* Attachments */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 space-y-4 border border-slate-700/50 shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
                      <Paperclip className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        Attachments
                      </h2>
                      <p className="text-xs text-slate-400">
                        Add files to your email
                      </p>
                    </div>
                  </div>
                  <div
                    {...getRootProps()}
                    className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-500/50 hover:bg-slate-900/30 transition-all duration-300 group"
                  >
                    <input {...getInputProps()} />
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-linear-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                        <Paperclip className="h-8 w-8 text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          Drop files here
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          or click to select files (PDF, Images, Documents)
                        </p>
                      </div>
                    </div>
                  </div>
                  {files.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-300">
                        Selected Files ({files.length})
                      </p>
                      <div className="max-h-[200px] overflow-y-auto space-y-2 custom-scrollbar">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-cyan-500/30 transition-all group"
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shrink-0">
                                <Paperclip className="h-4 w-4 text-cyan-400" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-sm text-white truncate block">
                                  {file.name}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {(file.size / 1024).toFixed(2)} KB
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFile(index)}
                              className="shrink-0 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Subject */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 space-y-3 border border-slate-700/50 shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-white">
                          Subject
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Write your subject content here..."
                            className="min-h-[60px] bg-slate-900/50 border-slate-700 focus:border-cyan-500 resize-none transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Email Content */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 space-y-4 border border-slate-700/50 shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        Email Content
                      </h2>
                      <p className="text-xs text-slate-400">
                        Write your email message
                      </p>
                    </div>
                    <Tabs
                      defaultValue="normal"
                      onValueChange={(value) =>
                        setIsMarkdown(value === "markdown")
                      }
                      className="bg-slate-900/50 rounded-lg"
                    >
                      <TabsList className="bg-transparent border border-slate-700">
                        <TabsTrigger
                          value="normal"
                          className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
                        >
                          Normal Editor
                        </TabsTrigger>
                        <TabsTrigger
                          value="markdown"
                          className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
                        >
                          Markdown Editor
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <div className="bg-slate-900/50 rounded-lg border border-slate-700 min-h-[500px] overflow-hidden hover:border-cyan-500/30 transition-colors">
                          {isMarkdown ? (
                            <div data-color-mode="dark">
                              <MDEditor
                                value={field.value}
                                onChange={(val) => field.onChange(val || "")}
                                preview="live"
                                height={500}
                                hideToolbar={false}
                                visibleDragbar={false}
                                enableScroll={true}
                                style={{
                                  backgroundColor: "transparent",
                                  borderRadius: "inherit",
                                }}
                              />
                            </div>
                          ) : (
                            <Textarea
                              {...field}
                              placeholder="Write your email content here..."
                              className="min-h-[500px] rounded-lg border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 p-4 bg-transparent"
                            />
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                disabled={isPending}
                size="lg"
                className="px-12 py-6 text-lg bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Sending Email...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default page;
