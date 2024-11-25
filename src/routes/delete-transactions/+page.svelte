<script>
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "$lib/components/ui/table";
    import { Loader2, Trash2 } from 'lucide-svelte';

    /** @type {import('./$types').PageData} */
    export let data;

    let deleteConfirmed = false;
    let loading = false;
    let deleteSuccess = false;

    $: totalDKP = data.transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

    function formatDate(dateString) {
        return new Date(dateString).toLocaleString();
    }

    async function deleteTransactions() {
        if (!deleteConfirmed) {
            deleteConfirmed = true;
            return;
        }

        try {
            loading = true;
            const deleteQuery = '*[_type == "dkpTransaction" && dateTime(_createdAt) > dateTime("2024-11-24T00:00:00Z")]';
            const result = await data.client.delete({query: deleteQuery});
            deleteSuccess = true;
            data.transactions = [];
        } catch (err) {
            console.error(err);
        } finally {
            loading = false;
        }
    }
</script>

<div class="container mx-auto p-4 max-w-4xl space-y-4">
    <Card>
        <CardHeader>
            <CardTitle>Delete DKP Transactions</CardTitle>
            <CardDescription>
                Transactions after November 24, 2024
            </CardDescription>
        </CardHeader>
        <CardContent>
            {#if loading}
                <div class="flex items-center justify-center p-8">
                    <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            {:else if deleteSuccess}
                <div class="text-center text-green-600 py-8">
                    Transactions successfully deleted!
                </div>
            {:else}
                {#if data.transactions?.length > 0}
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <div class="space-y-1">
                                <div class="text-sm font-medium">Total Transactions</div>
                                <div class="text-2xl font-bold">{data.transactions.length}</div>
                            </div>
                            <div class="space-y-1">
                                <div class="text-sm font-medium">Total DKP Impact</div>
                                <div class="text-2xl font-bold {totalDKP > 0 ? 'text-green-500' : 'text-red-500'}">
                                    {totalDKP > 0 ? '+' : ''}{totalDKP}
                                </div>
                            </div>
                            <Button
                                variant={deleteConfirmed ? "destructive" : "outline"}
                                on:click={deleteTransactions}
                                disabled={loading}
                            >
                                <Trash2 class="mr-2 h-4 w-4" />
                                {deleteConfirmed ? 'Confirm Delete' : 'Delete All'}
                            </Button>
                        </div>

                        <div class="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Member ID</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead class="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {#each data.transactions as transaction}
                                        <TableRow>
                                            <TableCell>{formatDate(transaction._createdAt)}</TableCell>
                                            <TableCell class="font-mono text-sm">{transaction.memberId}</TableCell>
                                            <TableCell>{transaction.reason}</TableCell>
                                            <TableCell class="text-right font-mono {transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}">
                                                {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                                            </TableCell>
                                        </TableRow>
                                    {/each}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                {:else}
                    <div class="text-center text-muted-foreground py-8">
                        No transactions found after November 24, 2024
                    </div>
                {/if}
            {/if}
        </CardContent>
    </Card>
</div>
