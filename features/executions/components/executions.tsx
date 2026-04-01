"use client";

import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import { formatDistanceToNow } from "date-fns";

import {
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { ExecutionStatus } from "../../../lib/generated/prisma/enums";
import {
  useSuspenseExecution,
  useSuspenseExecutions,
} from "../hooks/use-executions";
import { useExecutionsParams } from "../hooks/use-executions-params";

type ExecutionListItem = {
  id: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt: string | null;
  workflow: {
    id: string;
    name: string;
  };
};

export const ExecutionList = () => {
  const executions = useSuspenseExecutions();

  return (
    <EntityList
      items={executions.data.items}
      renderItem={(execution) => <ExecutionItem data={execution} />}
      getKey={(execution) => execution.id}
      emptyView={<ExecutionsEmpty />}
    />
  );
};

export const ExecutionsHeader = () => {
  return (
    <EntityHeader
      title="Executions"
      description="View and manage your executions"
    />
  );
};

export const ExecutionsPagination = () => {
  const executions = useSuspenseExecutions();
  const [params, setParams] = useExecutionsParams();

  return (
    <EntityPagination
      disabled={executions.isFetching}
      page={params.page}
      totalPages={executions.data.totalPages}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const ExecutionsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<ExecutionsHeader />}
      pagination={<ExecutionsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const ExecutionsLoading = () => {
  return <LoadingView message="loading Executions..." />;
};

export const ExecutionsError = () => {
  return <ErrorView message="Failed to load Executions" />;
};

export const ExecutionsEmpty = () => {
  return <EmptyView message="You haven't created any executions yet" />;
};

const getStatusIcon = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.SUCCESS:
      return <CheckCircle2Icon className="size-5 text-green-600" />;
    case ExecutionStatus.FAILED:
      return <XCircleIcon className="size-5 text-red-600" />;
    case ExecutionStatus.RUNNING:
      return <Loader2Icon className="size-5 text-blue-600 animate-spin" />;
    default:
      return <ClockIcon className="size-5 text-muted-foreground" />;
  }
};

export const ExecutionItem = ({ data }: { data: ExecutionListItem }) => {
  const startedAt = new Date(data.startedAt);
  const completedAt = data.completedAt ? new Date(data.completedAt) : null;

  const duration = completedAt
    ? Math.round((completedAt.getTime() - startedAt.getTime()) / 1000)
    : null;

  const subtitle = (
    <>
      {data.workflow.name} &bull; Started{" "}
      {formatDistanceToNow(startedAt, { addSuffix: true })}
      {duration !== null && <>&bull; Took {duration} seconds</>}
    </>
  );

  return (
    <EntityItem
      title={data.status.toLowerCase()}
      href={`/executions/${data.id}`}
      subtitle={subtitle}
      image={
        <div className="size-6 flex items-center justify-center">
          {getStatusIcon(data.status)}
        </div>
      }
    />
  );
};

export const ExecutionView = ({ executionId }: { executionId: string }) => {
  const { data: execution } = useSuspenseExecution(executionId);
  const [showStackTrace, setShowStackTrace] = useState(false);

  const duration = execution.completedAt
    ? Math.round(
        (new Date(execution.completedAt).getTime() -
          new Date(execution.startedAt).getTime()) /
          1000,
      )
    : null;

  const output = execution.output as unknown;
  const hasOutput = output != null;
  const outputText = hasOutput ? JSON.stringify(output, null, 2) : null;
  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          {getStatusIcon(execution.status)}
          <div>
            <CardTitle>{execution.status.toLowerCase()}</CardTitle>
            <CardDescription>
              Execution for {execution.workflow.name} &bull; Started{" "}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Workflow
            </p>
            <Link
              prefetch
              className="text-sm hover:underline text-primary"
              href={`/workflows/${execution.workflow.id}`}
            >
              {execution.workflow.name}
            </Link>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p className="text-sm">{execution.status.toLowerCase()} </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Started</p>
            <p className="text-sm">
              {formatDistanceToNow(new Date(execution.startedAt), {
                addSuffix: true,
              })}
            </p>
          </div>
          {execution.completedAt && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completed
              </p>
              <p className="text-sm">
                {formatDistanceToNow(new Date(execution.startedAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          )}
          {duration && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Duration
              </p>
              <p className="text-sm">{duration}s</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Ingest ID
            </p>
            <p className="text-sm">{execution.inngestEventId}</p>
          </div>
        </div>

        {execution.error && (
          <div className="mt-6 space-y-3 rounded-md bg-red-50 p-4 min-w-0">
            <div className="min-w-0">
              <p className="mb-2 text-sm font-medium text-red-900">Error</p>
              <p className="whitespace-pre-wrap break-all text-sm font-mono text-red-800">
                {execution.error}
              </p>
            </div>

            {execution.errorStack && (
              <Collapsible
                open={showStackTrace}
                onOpenChange={setShowStackTrace}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-900 hover:bg-red-100"
                  >
                    {showStackTrace ? "Hide Stack Trace" : "Show Stack Trace"}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <pre className="mt-2 overflow-auto rounded bg-red-100 p-2 text-xs font-mono text-red-800 whitespace-pre-wrap break-all">
                    {execution.errorStack}
                  </pre>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}
        {hasOutput && (
          <div className="mt-6 p-4 bg-muted rounded-md min-w-0">
            <p className="text-sm font-medium mb-2">Output</p>
            <pre className="text-sm font-mono overflow-auto">
              {outputText}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
