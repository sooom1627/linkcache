import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addLinkToCollection } from "../api/addLinkToCollection.api";
import { collectionQueryKeys, linkQueryKeys } from "../constants/queryKeys";
import type { CollectionLink } from "../types/links.types";

export interface AddLinkToCollectionArgs {
  collectionId: string;
  linkId: string;
}

export function useAddLinkToCollection() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addLinkToCollection,
    onSuccess: (_, { collectionId, linkId }) => {
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.links(collectionId),
      });
      queryClient.invalidateQueries({
        queryKey: linkQueryKeys.detail(linkId),
      });
    },
  });

  return {
    addLinkToCollection: mutation.mutate,
    addLinkToCollectionAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error as Error | null,
    data: mutation.data as CollectionLink | undefined,
    reset: mutation.reset,
  };
}
