"use client";

import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import type { Credential } from "../../../lib/generated/prisma/browser";
import { CredentialType } from "../../../lib/generated/prisma/enums";
import {
  useRemoveCredential,
  useSuspenseCredentials,
} from "../hooks/use-credentials";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import Image from "next/image";

export const CredentialsSearch = () => {
  const [params, setParams] = useCredentialsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      placeholder="Search credentials"
      value={searchValue}
      onChange={onSearchChange}
    />
  );
};

export const CredentialsList = () => {
  const credentials = useSuspenseCredentials();

  return (
    <EntityList
      items={credentials.data.items}
      renderItem={(credential) => (
        <CredentialItem
          data={{
            ...credential,
            createdAt: new Date(credential.createdAt),
            updatedAt: new Date(credential.updatedAt),
          }}
        />
      )}
      getKey={(credential) => credential.id}
      emptyView={<CredentialsEmpty />}
    />
  );
};

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
  return (
    <EntityHeader
      title="Credentials"
      description="Create and manage credentials"
      newButtonLabel="New Credential"
      newButtonHref={"/credentials/new"}
      disabled={disabled}
    />
  );
};

export const CredentialsPagination = () => {
  const credentials = useSuspenseCredentials();
  const [params, setParams] = useCredentialsParams();

  return (
    <EntityPagination
      disabled={credentials.isFetching}
      page={params.page}
      totalPages={credentials.data.totalPages}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const CredentialsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<CredentialsHeader />}
      search={<CredentialsSearch />}
      pagination={<CredentialsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const CredentialsLoading = () => {
  return <LoadingView message="loading Credentials..." />;
};

export const CredentialsError = () => {
  return <ErrorView message="Failed to load Credentials" />;
};

export const CredentialsEmpty = () => {
  const router = useRouter();

  const handleCreate = () => {
    router.push(`/credentials/new`);
  };

  return (
      <EmptyView
        message="You haven't created any credentials yet"
        onNew={handleCreate}
      />
  );
};

const credentialLogos: Record<CredentialType, string> = {
  [CredentialType.GEMINI]: "/logos/gemini.svg",
  [CredentialType.ANTHROPIC]: "/logos/anthropic.svg",
  [CredentialType.OPENAI]: "/logos/openai.svg",
};

export const CredentialItem = ({ data }: { data: Credential }) => {
  const removeCredential = useRemoveCredential();

  const handleRemove = () => {
    removeCredential.mutate({ id: data.id });
    // Consider using a toast notification or error state
  };

  const logo = credentialLogos[data.type] || "/logos/gemini.svg";

  return (
    <EntityItem
      title={data.name}
      href={`/credentials/${data.id}`}
      subtitle={
        <>
          Created{" "}
          {formatDistanceToNow(new Date(data.updatedAt), { addSuffix: true })}
          {" "}
          &bull; Updated{" "}
          {formatDistanceToNow(new Date(data.createdAt), { addSuffix: true })}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <Image src={logo} alt={data.type} width={20} height={20} />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeCredential.isPending}
    />
  );
};
