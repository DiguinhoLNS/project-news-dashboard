/**
 * Metadados que o `queryClient` lê para decidir o que notificar ao usuário.
 *
 * O `declare module` abaixo tipa o campo `meta` de todas as queries e mutations,
 * então o autocomplete funciona direto em `useQuery`/`useMutation`/`queryOptions`.
 */

/**
 * Meta de uma query. Toda query que falha exibe um toast de erro por padrão.
 */
export type TQueryMeta = {
    /**
     * Mensagem do toast de erro. Sem ela, usa a mensagem tratada do próprio erro.
     */
    errorMessage?: string

    /**
     * Não exibe toast quando a request falha.
     * Use quando a tela já mostra o erro de outra forma (mensagem inline, estado vazio etc.).
     */
    silent?: boolean
}

/**
 * Meta de uma mutation. Diferente das queries, o sucesso só notifica quando há `successMessage`.
 */
export type TMutationMeta = TQueryMeta & {
    successMessage?: string
}

declare module '@tanstack/react-query' {
    interface Register {
        queryMeta: TQueryMeta
        mutationMeta: TMutationMeta
    }
}
