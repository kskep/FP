<!-- src/routes/members/+page.svelte -->
<script>
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
  } from "$lib/components/ui/dialog";
  import {
    Card,
    CardContent,
    CardHeader,
    CardFooter,
    CardTitle,
  } from "$lib/components/ui/card";
  import { writable } from "svelte/store";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import { Plus, Minus, History } from 'lucide-svelte';
  /** @type {import('./$types').PageData} */
  export let data;

  const isOfficer = writable(false);
  let showPasswordDialog = false;
  let password = "";

  onMount(() => {
    if (browser) {
      $isOfficer = sessionStorage.getItem("isOfficer") === "true";
    }
  });



  let newMember = {
    name: "",
    rank: "Member",
    dkp: 0,
  };

  let editingMember = null;
  let showEditDialog = false;

  const ranks = ["Guild Leader", "Advisor", "Guardian", "Member"];

  function openEditDialog(member) {
    console.log("Opening edit dialog for member:", member);
    if (!member._id || !member.name || !member.rank) {
      console.error("Invalid member data:", member);
      alert("Invalid member data");
      return;
    }

    editingMember = {
      _id: member._id,
      name: member.name,
      rank: member.rank,
      dkp: member.dkp || 0,
    };
    showEditDialog = true;
  }

  let showHistoryDialog = false;
  let selectedMemberHistory = null;

  function openHistoryDialog(member) {
    selectedMemberHistory = member;
    showHistoryDialog = true;
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleString();
  }

  async function saveMemberEdit() {
    if (!editingMember) return;

    try {
      console.log("Attempting to save member edit:", editingMember);

      const updateData = {
        name: editingMember.name,
        rank: editingMember.rank,
      };

      console.log("Sending update request with data:", updateData);

      const response = await fetch(`/api/members/${editingMember._id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseData = await response.json().catch((e) => null);
      console.log("Response status:", response.status);
      console.log("Response data:", responseData);

      if (response.ok) {
        console.log("Update successful");
        showEditDialog = false;
        window.location.reload();
      } else {
        const errorMessage = responseData?.error || "Unknown error occurred";
        console.error("Failed to update member:", errorMessage);
        alert(`Failed to update member: ${errorMessage}`);
      }
    } catch (err) {
      console.error("Error in saveMemberEdit:", err);
      alert(
        "Error updating member: " + (err.message || "Unknown error occurred")
      );
    }
  }

  async function addMember() {
    if (!newMember.name) return;

    try {
      const response = await fetch("/api/members", {
        method: "POST",
        body: JSON.stringify(newMember),
        headers: {
          "content-type": "application/json",
        },
      });

      if (response.ok) {
        // Clear form
        newMember = {
          name: "",
          rank: "Member",
          dkp: 0,
        };
        // Refresh data
        window.location.reload();
      }
    } catch (err) {
      console.error("Error adding member:", err);
    }
  }

  let showDkpDialog = false;
  let selectedMember = null;
  let dkpAmount = 0;
  let dkpReason = "Raid Participation";

  const dkpReasons = [
    "Raid Participation",
    "Item Purchase",
    "Bonus",
    "Penalty",
    "Adjustment",
  ];

  function openDkpDialog(member) {
    selectedMember = member;
    dkpAmount = 0;
    showDkpDialog = true;
  }

  async function adjustDKP() {
    if (!selectedMember || !dkpAmount) return;

    try {
      const response = await fetch(`/api/members/${selectedMember._id}/dkp`, {
        method: "POST",
        body: JSON.stringify({
          amount: parseInt(dkpAmount),
          reason: dkpReason,
        }),
        headers: {
          "content-type": "application/json",
        },
      });

      if (response.ok) {
        showDkpDialog = false;
        window.location.reload();
      }
    } catch (err) {
      console.error("Error adjusting DKP:", err);
    }
  }

  async function quickAdjustDKP(member, amount) {
    console.log("Adjusting DKP for member:", member);

    try {
      const response = await fetch("/api/dkp", {
        method: "POST",
        body: JSON.stringify({
          memberId: member._id,
          amount: amount,
          reason: "Quick Adjustment",
        }),
        headers: {
          "content-type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("DKP adjustment successful:", result);
        window.location.reload();
      } else {
        console.error("DKP adjustment failed:", await response.text());
      }
    } catch (err) {
      console.error("Error adjusting DKP:", err);
    }
  }

  async function deleteMember(memberId) {
    if (
      !confirm(
        "Are you sure you want to delete this member? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.reload();
      } else {
        console.error("Failed to delete member:", await response.text());
      }
    } catch (err) {
      console.error("Error deleting member:", err);
    }
  }

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
            if (browser) {
                sessionStorage.setItem("isOfficer", "true");
            }
            window.location.reload();
        } else {
            alert("Incorrect password");
        }
    }
</script>

<div class="container mx-auto p-4 space-y-4">
  <!-- Always show members list, but with different views for officers/non-officers -->
  <Card>
    <CardHeader>
      <div class="flex justify-between items-center">
        <CardTitle>Guild Members</CardTitle>
        <div class="flex gap-4 items-center">
          <div class="text-sm text-gray-500">
            Total Members: {data.members?.length || 0}
          </div>
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

  {#if $isOfficer}
    <!-- Add Member Card - Only visible to officers -->
    <Card>
      <CardHeader>
        <CardTitle>Add New Member</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="space-y-2">
            <Label for="name">Member Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter member name"
              bind:value={newMember.name}
            />
          </div>
          <div class="space-y-2">
            <Label for="rank">Rank</Label>
            <select
              id="rank"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
              bind:value={newMember.rank}
            >
              {#each ranks as rank}
                <option value={rank}>{rank}</option>
              {/each}
            </select>
          </div>
          <div class="space-y-2">
            <Label for="dkp">Starting DKP</Label>
            <Input
              id="dkp"
              type="number"
              placeholder="0"
              bind:value={newMember.dkp}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button on:click={addMember} class="hover-gradient">Add Member</Button>
      </CardFooter>
    </Card>
    {/if}

    <!-- Members Table Card -->
    <Card>
      <CardContent>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Rank</TableHead>
                <TableHead>DKP</TableHead>
                {#if $isOfficer}
                  <TableHead>History</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                {/if}
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each data.members || [] as member}
              <TableRow>
                <TableCell class="font-medium">{member.name}</TableCell>
                <TableCell>
                  <span
                    class="px-2 py-1 rounded-full text-xs rank-badge
                    {member.rank === 'Guild Leader'
                      ? 'bg-purple-100 text-purple-800'
                      : member.rank === 'Advisor'
                        ? 'bg-blue-100 text-blue-800'
                        : member.rank === 'Guardian'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'}"
                  >
                    {member.rank}
                  </span>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <span>{member.dkp || 0}</span>
                    {#if $isOfficer}
                      <div class="flex gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          class="h-6 w-6"
                          on:click={() => quickAdjustDKP(member, 10)}
                        >
                          <Plus class="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          class="h-6 w-6"
                          on:click={() => quickAdjustDKP(member, -10)}
                        >
                          <Minus class="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          class="h-6 w-6"
                          on:click={() => openDkpDialog(member)}
                        >
                          <History class="h-4 w-4" />
                        </Button>
                      </div>
                    {/if}
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-muted-foreground">
                      {data.transactionsByMember[member._id]?.length || 0} transactions
                    </span>
                    {#if data.transactionsByMember[member._id]?.length}
                      <div class="flex gap-1">
                        {#each data.transactionsByMember[member._id].slice(0, 3) as transaction}
                          <span
                            class="w-2 h-2 rounded-full {transaction.amount > 0
                              ? 'bg-green-500'
                              : 'bg-red-500'}"
                            title="{transaction.amount} DKP - {transaction.reason}"
                          ></span>
                        {/each}
                        {#if data.transactionsByMember[member._id].length > 3}
                          <span class="text-xs text-muted-foreground">
                            +{data.transactionsByMember[member._id].length - 3} more
                          </span>
                        {/if}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        class="h-8 px-2"
                        on:click={() => openHistoryDialog(member)}
                      >
                        View All
                      </Button>
                    {:else}
                      <span class="text-xs text-muted-foreground">No history</span>
                    {/if}
                  </div>
                </TableCell>
                {#if $isOfficer}
                  <TableCell class="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      on:click={() => openEditDialog(member)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                {/if}
              </TableRow>
              {/each}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>

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

<Dialog bind:open={showEditDialog}>
  <DialogContent
    class="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-background border rounded-lg shadow-lg w-full max-w-md"
  >
    <DialogHeader>
      <DialogTitle>Edit Member</DialogTitle>
    </DialogHeader>

    {#if editingMember}
      <div class="grid gap-4 py-4">
        <div class="space-y-2">
          <Label for="edit-name">Name</Label>
          <Input id="edit-name" bind:value={editingMember.name} />
        </div>
        <div class="space-y-2">
          <Label for="edit-rank">Rank</Label>
          <select
            id="edit-rank"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
            bind:value={editingMember.rank}
          >
            {#each ranks as rank}
              <option value={rank}>{rank}</option>
            {/each}
          </select>
        </div>
        <div class="space-y-2">
          <Label for="edit-dkp">Current DKP</Label>
          <Input
            id="edit-dkp"
            type="number"
            bind:value={editingMember.dkp}
            disabled
          />
          <span class="text-xs text-muted-foreground"
            >DKP can only be modified through the DKP system</span
          >
        </div>
      </div>
      <DialogFooter class="flex justify-between items-center mt-4">
        <Button
          variant="destructive"
          on:click={() => deleteMember(editingMember._id)}
        >
          Delete Member
        </Button>
        <div class="flex gap-2">
          <Button variant="outline" on:click={() => (showEditDialog = false)}>
            Cancel
          </Button>
          <Button variant="default" on:click={saveMemberEdit}>
            Save Changes
          </Button>
        </div>
      </DialogFooter>
    {/if}
  </DialogContent>
</Dialog>

<Dialog bind:open={showDkpDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Adjust DKP for {selectedMember?.name}</DialogTitle>
    </DialogHeader>

    {#if selectedMember}
      <div class="grid gap-4 py-4">
        <div class="space-y-2">
          <Label for="dkp-amount">DKP Amount</Label>
          <Input
            id="dkp-amount"
            type="number"
            bind:value={dkpAmount}
            placeholder="Enter amount (negative for deduction)"
          />
        </div>
        <div class="space-y-2">
          <Label for="dkp-reason">Reason</Label>
          <select
            id="dkp-reason"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
            bind:value={dkpReason}
          >
            {#each dkpReasons as reason}
              <option value={reason}>{reason}</option>
            {/each}
          </select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" on:click={() => (showDkpDialog = false)}>
          Cancel
        </Button>
        <Button on:click={adjustDKP}>Apply DKP Change</Button>
      </DialogFooter>
    {/if}
  </DialogContent>
</Dialog>

<Dialog bind:open={showHistoryDialog}>
  <DialogContent
    class="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-background border rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden"
  >
    <DialogHeader>
      <DialogTitle>DKP History - {selectedMemberHistory?.name}</DialogTitle>
    </DialogHeader>

    {#if selectedMemberHistory}
      <div class="overflow-y-auto max-h-[60vh] p-4">
        {#if data.transactionsByMember[selectedMemberHistory._id]?.length}
          <div class="space-y-4">
            {#each data.transactionsByMember[selectedMemberHistory._id] as transaction}
              <div
                class="flex items-center justify-between p-3 rounded-lg border border-border {transaction.amount >
                0
                  ? 'bg-green-500/10'
                  : 'bg-red-500/10'}"
              >
                <div class="space-y-1">
                  <div class="font-medium">
                    {transaction.reason}
                  </div>
                  <div class="text-sm text-muted-foreground">
                    {formatDate(transaction.date)}
                  </div>
                </div>
                <div
                  class="text-lg font-mono tabular-nums {transaction.amount > 0
                    ? 'text-green-400'
                    : 'text-red-400'}"
                >
                  {transaction.amount > 0 ? "+" : ""}{transaction.amount}
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center text-muted-foreground py-8">
            No DKP history found for this member
          </div>
        {/if}
      </div>
      <DialogFooter class="mt-4">
        <div class="w-full flex justify-between items-center">
          <div class="text-sm text-muted-foreground">
            Total Transactions: {data.transactionsByMember[
              selectedMemberHistory._id
            ]?.length || 0}
          </div>
          <Button
            variant="outline"
            on:click={() => (showHistoryDialog = false)}
          >
            Close
          </Button>
        </div>
      </DialogFooter>
    {/if}
  </DialogContent>
</Dialog>
