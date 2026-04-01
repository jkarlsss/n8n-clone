import { requireAuth } from "@/lib/auth-utils";
import { SearchParams } from "nuqs";
import { HydrateClient } from "../../../../trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { executionsParamsLoader } from "../../../../features/executions/server/params-loader";
import { prefetchExecutions } from "../../../../features/executions/server/prefetch";
import { ExecutionList, ExecutionsContainer, ExecutionsError, ExecutionsLoading } from "../../../../features/executions/components/executions";

type Props = {
  searchParams: Promise<SearchParams>;
}

const Page = async ({ searchParams }: Props ) => {
  await requireAuth();

  const params = await executionsParamsLoader(searchParams);

  prefetchExecutions(params);
  
  return (
    <ExecutionsContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<ExecutionsError />}>
          <Suspense fallback={<ExecutionsLoading />}>
            <ExecutionList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </ExecutionsContainer>
  )
}

export default Page