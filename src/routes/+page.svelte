<!-- src/routes/+page.svelte -->
<script>
    import {
      Card,
      CardContent,
      CardDescription,
      CardHeader,
      CardTitle,
    } from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import {
      Table,
      TableBody,
      TableCell,
      TableHead,
      TableHeader,
      TableRow,
    } from "$lib/components/ui/table";
    import { ScrollArea } from "$lib/components/ui/scroll-area";
    import { Megaphone, Trophy, Search } from 'lucide-svelte';
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";

    /** @type {import('./$types').PageData} */
    export let data;

    // For wishlist filtering
    let selectedItem = '';
    let uniqueWishlistItems = [];

    // Process wishlist items to get unique items
    $: {
      const items = new Set();
      data.members?.forEach(member => {
        member.wishlist?.forEach(item => {
          items.add(item.name);
        });
      });
      uniqueWishlistItems = Array.from(items);
    }

    // Filter members by selected wishlist item
    $: filteredWishlist = selectedItem
      ? data.members?.filter(member =>
          member.wishlist?.some(item => item.name === selectedItem)
        )
      : [];

    // Sort members by DKP
    $: sortedMembers = [...(data.members || [])].sort((a, b) => (b.dkp || 0) - (a.dkp || 0));
  </script>

  <div class="container mx-auto p-4">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Announcement Card -->
      <Card class="md:col-span-3 hover:shadow-lg transition-shadow">
        <CardHeader>
          <div class="flex items-center gap-2">
            <Megaphone class="h-5 w-5 text-primary" />
            <CardTitle>Important Announcement</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div class="p-4 rounded-lg bg-primary/5 border">
            <h3 class="font-semibold text-lg mb-2">Welcome to Final Performance Guild Activity Tracker!</h3>
            <p class="text-muted-foreground">
              This is our new guild activity tracking system for Throne and Liberty.
              Here you can track DKP, manage wishlists, and more.
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- DKP Leaderboard -->
      <Card class="md:col-span-2 hover:shadow-lg transition-shadow">
        <CardHeader>
          <div class="flex items-center gap-2">
            <Trophy class="h-5 w-5 text-primary" />
            <CardTitle>DKP Leaderboard</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea class="h-[400px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Guild Rank</TableHead>
                  <TableHead class="text-right">DKP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {#each sortedMembers as member, i}
                  <TableRow>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell class="font-medium">{member.name}</TableCell>
                    <TableCell>
                      <span class="px-2 py-1 rounded-full text-xs
                        {member.rank === 'Guild Leader' ? 'bg-purple-100 text-purple-800' :
                        member.rank === 'Advisor' ? 'bg-blue-100 text-blue-800' :
                        member.rank === 'Guardian' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'}">
                        {member.rank}
                      </span>
                    </TableCell>
                    <TableCell class="text-right font-mono">{member.dkp || 0}</TableCell>
                  </TableRow>
                {/each}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <!-- Wishlist Tracker -->
      <Card class="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div class="flex items-center gap-2">
            <Search class="h-5 w-5 text-primary" />
            <CardTitle>Wishlist Tracker</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="item-filter">Filter by Item</Label>
              <select
                id="item-filter"
                class="w-full rounded-md border border-input bg-background px-3 py-2"
                bind:value={selectedItem}
              >
                <option value="">Select an item...</option>
                {#each uniqueWishlistItems as item}
                  <option value={item}>{item}</option>
                {/each}
              </select>
            </div>

            {#if selectedItem}
              <ScrollArea class="h-[300px] w-full rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>DKP</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {#each filteredWishlist.sort((a, b) => (b.dkp || 0) - (a.dkp || 0)) as member}
                      {#each member.wishlist.filter(item => item.name === selectedItem) as item}
                        <TableRow>
                          <TableCell>
                            <div class="flex flex-col">
                              <span class="font-medium">{member.name}</span>
                              <span class="text-xs text-muted-foreground">{member.rank}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span class="font-mono">{member.dkp || 0}</span>
                          </TableCell>
                          <TableCell>
                            <span class="px-2 py-1 rounded-full text-xs
                              {item.status === 'Claimed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                              {item.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      {/each}
                    {/each}
                  </TableBody>
                </Table>
              </ScrollArea>
            {:else}
              <div class="text-center text-muted-foreground py-8">
                Select an item to see who has it on their wishlist
              </div>
            {/if}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
