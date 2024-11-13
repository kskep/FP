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
    Card,
    CardContent,
    CardHeader,
    CardTitle,
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

  let showAddDialog = false;
  let selectedMember = null;
  let newItem = {
    name: "",
    source: "",
    status: "Pending", // Changed from 'Claimed' to 'Pending'
    notes: "",
  };

  const priorities = ["High", "Normal", "Low"];
  const statuses = ["Pending", "Claimed"];

  function openAddDialog(member) {
    selectedMember = member;
    newItem = {
      name: "",
      source: "",
      status: "Pending",
      notes: "",
    };
    showAddDialog = true;
  }

  const isOfficer = writable(false);
  let showPasswordDialog = false;
  let password = "";

  onMount(() => {
    if (browser) {
      $isOfficer = sessionStorage.getItem("isOfficer") === "true";
    }
  });

  async function addWishlistItem() {
    if (!selectedMember || !newItem.name || !newItem.source) return;

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        body: JSON.stringify({
          memberId: selectedMember._id,
          item: {
            name: newItem.name,
            source: newItem.source, // Make sure this is included
            status: newItem.status,
            notes: newItem.notes,
          },
        }),
        headers: {
          "content-type": "application/json",
        },
      });

      if (response.ok) {
        showAddDialog = false;
        window.location.reload();
      }
    } catch (err) {
      console.error("Error adding wishlist item:", err);
    }
  }

  async function updateItemStatus(itemId, newStatus) {
    try {
      const response = await fetch(`/api/wishlist/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
        headers: {
          "content-type": "application/json",
        },
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Error updating wishlist item:", err);
    }
  }

  async function deleteWishlistItem(itemId) {
    if (!confirm("Are you sure you want to delete this wishlist item?")) return;

    try {
      const response = await fetch(`/api/wishlist/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Error deleting wishlist item:", err);
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
      // Store in sessionStorage so it persists during page refreshes
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
        <CardTitle>Wishlist Management</CardTitle>
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
    </CardHeader>
  </Card>

  <!-- Member Wishlists -->
  {#each data.members as member}
    <Card class="overflow-hidden">
      <CardHeader class="py-4">
        <div class="flex justify-between items-center">
          <CardTitle class="text-lg">{member.name}'s Wishlist</CardTitle>
          {#if $isOfficer}
            <Button size="sm" on:click={() => openAddDialog(member)}>
              Add Item
            </Button>
          {/if}
        </div>
      </CardHeader>
      <CardContent class="p-0">
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[200px]">Item</TableHead>
                <TableHead class="w-[150px]">Source</TableHead>
                <TableHead class="w-[120px]">Status</TableHead>
                <TableHead class="w-[200px]">Notes</TableHead>
                {#if $isOfficer}
                  <TableHead class="w-[100px]">Actions</TableHead>
                {/if}
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each member.wishlist || [] as item}
                <TableRow class="h-[40px]">
                  <TableCell class="py-1">{item.name}</TableCell>
                  <TableCell class="py-1 text-sm text-muted-foreground"
                    >{item.source}</TableCell
                  >
                  <TableCell class="py-1">
                    {#if $isOfficer}
                      <select
                        class="h-7 rounded-md border border-input bg-background px-2 py-0 text-sm dark:bg-gray-950 dark:border-gray-800
                                {item.status === 'Claimed'
                          ? 'text-green-500 font-medium'
                          : 'text-muted-foreground'}"
                        value={item.status}
                        on:change={(e) =>
                          updateItemStatus(item._id, e.target.value)}
                      >
                        {#each statuses as status}
                          <option value={status}>{status}</option>
                        {/each}
                      </select>
                    {:else}
                      <span
                        class="px-2 py-1 rounded-full text-xs
                            {item.status === 'Claimed'
                          ? 'text-green-500 font-medium'
                          : 'text-muted-foreground'}"
                      >
                        {item.status}
                      </span>
                    {/if}
                  </TableCell>

                  <TableCell class="py-1">
                    <div
                      class="text-sm text-muted-foreground truncate max-w-[200px]"
                    >
                      {item.notes || "-"}
                    </div>
                  </TableCell>
                  {#if $isOfficer}
                    <TableCell class="py-1">
                      <Button
                        variant="destructive"
                        size="sm"
                        class="h-7 px-2"
                        on:click={() => deleteWishlistItem(item._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  {/if}
                </TableRow>
                {/each}
                {#if !member.wishlist?.length}
                  <TableRow>
                    <TableCell
                      colspan="5"
                      class="text-center text-sm text-muted-foreground py-4"
                    >
                      No items in wishlist
                    </TableCell>
                  </TableRow>
                {/if}
              </TableBody>
            </Table>

        </div>
      </CardContent>
    </Card>
  {/each}
</div>

<!-- Add Item Dialog -->
<Dialog bind:open={showAddDialog}>
  <DialogContent class="max-w-md">
    <DialogHeader>
      <DialogTitle>Add Wishlist Item for {selectedMember?.name}</DialogTitle>
    </DialogHeader>

    <div class="grid gap-4 py-4">
      <div class="space-y-2">
        <Label for="item-name">Item Name</Label>
        <Input
          id="item-name"
          placeholder="Enter item name"
          bind:value={newItem.name}
        />
      </div>

      <div class="space-y-2">
        <Label for="source">Drop Source</Label>
        <Input
          id="source"
          placeholder="Boss or location where item drops"
          bind:value={newItem.source}
        />
      </div>

      <div class="space-y-2">
        <Label for="notes">Notes</Label>
        <Input
          id="notes"
          placeholder="Optional notes"
          bind:value={newItem.notes}
        />
      </div>
    </div>

    <DialogFooter>
      <Button
        variant="outline"
        size="sm"
        on:click={() => (showAddDialog = false)}
      >
        Cancel
      </Button>
      <Button
        size="sm"
        on:click={addWishlistItem}
        disabled={!newItem.name || !newItem.source}
      >
        Add Item
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
