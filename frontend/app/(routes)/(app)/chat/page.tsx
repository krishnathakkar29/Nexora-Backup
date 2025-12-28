import Chats from "@/components/pages/chat/chats";
import { fetchAPIServer } from "@/lib/fetch-api-server";
import { getQueryClient } from "@/lib/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

async function page() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["chat-pdfs"],
    queryFn: async () => {
      const response = await fetchAPIServer({
        url: "/chat/pdfs",
        method: "GET",
        requireAuth: true,
        throwOnError: false,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch email history");
      }

      return response.data;
    },
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Chats />
    </HydrationBoundary>
  );
}

export default page;
