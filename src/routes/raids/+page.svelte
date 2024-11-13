<script>
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "$lib/components/ui/table";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import {
        Card,
        CardContent,
        CardHeader,
        CardTitle,
        CardDescription
    } from "$lib/components/ui/card";
    import {
        Dialog,
        DialogContent,
        DialogHeader,
        DialogTitle,
        DialogFooter,
    } from "$lib/components/ui/dialog";
    import { writable } from "svelte/store";
    import { onMount } from "svelte";
    import { browser } from "$app/environment";


    /** @type {import('./$types').PageData} */
    export let data;

    const isOfficer = writable(false);
    let showPasswordDialog = false;
    let password = "";

    let showCreateDialog = false;
    let newRaid = {
        name: '',
        dkpReward: 0,
        participants: []
    };

    async function createRaid() {
        try {
            const response = await fetch('/api/raids', {
                method: 'POST',
                body: JSON.stringify(newRaid),
                headers: {
                    'content-type': 'application/json'
                }
            });

            if (response.ok) {
                showCreateDialog = false;
                window.location.reload();
            }
        } catch (err) {
            console.error('Error creating raid:', err);
        }
    }

    async function deleteRaid(raid) {
    if (!confirm(`Are you sure you want to delete raid "${raid.name}"? This will deduct ${raid.dkpReward} DKP from all participants.`)) {
        return;
    }

    try {
        const response = await fetch(`/api/raids/${raid._id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            window.location.reload();
        } else {
            const error = await response.json();
            console.error('Failed to delete raid:', error);
            alert('Failed to delete raid: ' + (error.error || 'Unknown error'));
        }
    } catch (err) {
        console.error('Error deleting raid:', err);
        alert('Error deleting raid: ' + err.message);
    }
}
onMount(() => {
        if (browser) {
            $isOfficer = sessionStorage.getItem("isOfficer") === "true";
        }
    });

    async function checkPassword() {
        const response = await fetch("/api/check-password", {
            method: "POST",
            body: JSON.stringify({ password }),
            headers: {
                "content-type": "application/json",
            },
        });

        if (response.ok) {
            $isOfficer = true;
            showPasswordDialog = false;
            sessionStorage.setItem("isOfficer", "true");
        } else {
            alert("Incorrect password");
        }
    }

</script>

<div class="container mx-auto p-4 space-y-4">
    <Card>
        <CardHeader>
            <div class="flex justify-between items-center">
                <CardTitle>Raid History</CardTitle>
                <div class="flex gap-2">
                    {#if $isOfficer}
                        <Button
                            variant="outline"
                            size="sm"
                            on:click={() => {
                                $isOfficer = false;
                                sessionStorage.removeItem("isOfficer");
                            }}
                        >
                            Exit Officer Mode
                        </Button>
                        <Button on:click={() => showCreateDialog = true}>
                            Add Raid Rewards
                        </Button>
                    {:else}
                        <Button
                            variant="outline"
                            size="sm"
                            on:click={() => (showPasswordDialog = true)}
                        >
                            Officer Login
                        </Button>
                    {/if}
                </div>
            </div>
        </CardHeader>
    </Card>

    <Card>
        <CardContent>
            <div class="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Raid Name</TableHead>
                            <TableHead>Participants</TableHead>
                            <TableHead>DKP Awarded</TableHead>
                            <TableHead>Total DKP</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {#each data.raids as raid}
                            <TableRow>
                                <TableCell>{new Date(raid.date).toLocaleString()}</TableCell>
                                <TableCell>{raid.name}</TableCell>
                                <TableCell>
                                    <div class="flex flex-wrap gap-1">
                                        {#each raid.participants as participant}
                                            <span class="px-2 py-1 text-xs bg-gray-100 rounded-full">
                                                {participant.name}
                                            </span>
                                        {/each}
                                    </div>
                                </TableCell>
                                <TableCell>{raid.dkpReward}</TableCell>
                                <TableCell>{raid.dkpReward * raid.participants.length}</TableCell>
                                <TableCell>
                                    <TableCell>
                                        {#if $isOfficer}
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                on:click={() => deleteRaid(raid)}
                                            >
                                                Delete Raid
                                            </Button>
                                        {/if}
                                    </TableCell>
                                </TableCell>
                            </TableRow>
                        {/each}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
</div>

<Dialog bind:open={showCreateDialog}>
    <DialogContent class="max-w-2xl">
        <DialogHeader>
            <DialogTitle>Add Raid Rewards</DialogTitle>
        </DialogHeader>

        <div class="grid gap-4 py-4">
            <!-- Previous Raids Templates -->
            {#if data.raids.length > 0}
                <div class="space-y-2">
                    <Label>Quick Select from Previous Raids</Label>
                    <div class="flex flex-wrap gap-2">
                        {#each data.raids.slice(0, 5) as raid}
                            <Button
                                variant="outline"
                                size="sm"
                                class="flex items-center gap-2"
                                on:click={() => {
                                    newRaid.participants = raid.participants.map(p => p._id);
                                }}
                            >
                                <span>{raid.name}</span>
                                <span class="text-xs text-gray-500">
                                    ({raid.participants.length} members)
                                </span>
                            </Button>
                        {/each}
                    </div>
                </div>
            {/if}

            <div class="space-y-2">
                <Label for="raid-name">Raid Name</Label>
                <Input
                    id="raid-name"
                    placeholder="Enter raid name"
                    bind:value={newRaid.name}
                />
            </div>

            <div class="space-y-2">
                <Label for="raid-dkp">DKP Reward per Member</Label>
                <Input
                    id="raid-dkp"
                    type="number"
                    placeholder="Enter DKP amount"
                    bind:value={newRaid.dkpReward}
                />
            </div>

            <div class="space-y-2">
                <div class="flex justify-between items-center">
                    <Label>Select Participants</Label>
                    {#if newRaid.participants.length > 0}
                        <Button
                            variant="outline"
                            size="sm"
                            on:click={() => newRaid.participants = []}
                        >
                            Clear Selection
                        </Button>
                    {/if}
                </div>
                <div class="h-48 overflow-y-auto border rounded p-2 space-y-2">
                    {#each data.members as member}
                        <label class="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded">
                            <input
                                type="checkbox"
                                class="rounded border-gray-300"
                                bind:group={newRaid.participants}
                                value={member._id}
                            />
                            <span>{member.name}</span>
                            <span class="text-sm text-gray-500">({member.rank})</span>
                        </label>
                    {/each}
                </div>
            </div>

            <div class="bg-gray-50 -mx-6 px-6 py-2 mt-2">
                <div class="text-sm text-gray-500">
                    Selected: {newRaid.participants.length} members
                    {#if newRaid.participants.length > 0 && newRaid.dkpReward}
                        • Total DKP to distribute: {newRaid.dkpReward * newRaid.participants.length}
                    {/if}
                </div>
                {#if newRaid.participants.length > 0}
                    <div class="mt-1 flex flex-wrap gap-1">
                        {#each newRaid.participants as participantId}
                            {@const member = data.members.find(m => m._id === participantId)}
                            {#if member}
                                <span class="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                    {member.name}
                                </span>
                            {/if}
                        {/each}
                    </div>
                {/if}
            </div>
        </div>

        <DialogFooter>
            <Button
                variant="outline"
                on:click={() => {
                    showCreateDialog = false;
                    newRaid = {
                        name: '',
                        dkpReward: 0,
                        participants: []
                    };
                }}
            >
                Cancel
            </Button>
            <Button
                on:click={createRaid}
                disabled={!newRaid.name || !newRaid.dkpReward || newRaid.participants.length === 0}
            >
                Create and Award DKP
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>

<Dialog bind:open={showPasswordDialog}>
    <DialogContent class="max-w-md">
        <DialogHeader>
            <DialogTitle>Officer Login</DialogTitle>
        </DialogHeader>

        <div class="grid gap-4 py-4">
            <div class="space-y-2">
                <Label for="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="Enter officer password"
                    bind:value={password}
                />
            </div>
        </div>

        <DialogFooter>
            <Button variant="outline" on:click={() => (showPasswordDialog = false)}>
                Cancel
            </Button>
            <Button on:click={checkPassword}>Login</Button>
        </DialogFooter>
    </DialogContent>
</Dialog>