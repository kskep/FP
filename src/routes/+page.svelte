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
    import { Separator } from "$lib/components/ui/separator";

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

<div class="container mx-auto p-4 space-y-4">
  <!-- Announcement - Full Width -->
  <Card class="hover:shadow-lg transition-shadow">
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

  <!-- Leaderboard and Wishlist side by side -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- DKP Leaderboard -->
    <Card class="hover:shadow-lg transition-shadow">
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

  <!-- DKP Rules - Full Width -->
  <Card class="hover:shadow-lg transition-shadow">
    <CardHeader class="border-b">
        <div class="flex items-center justify-between pb-6">
            <div>
                <CardTitle class="text-2xl font-bold">Guild DKP System</CardTitle>
                <CardDescription class="text-base mt-1">Comprehensive Guide to Item Distribution</CardDescription>
            </div>
            <!-- Optional: Add an icon or guild logo here -->
        </div>
    </CardHeader>
    <CardContent class="p-6">
        <!-- Point Awards Section - Made more visual -->
        <div class="mb-8">
            <h3 class="text-xl font-semibold mb-4 flex items-center">
                <Trophy class="h-5 w-5 mr-2 text-primary" />
                Point Awards
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="p-4 rounded-lg border bg-card hover:shadow-md transition-all">
                    <div class="text-lg font-medium">Guild Bosses</div>
                    <div class="text-2xl font-bold text-primary mt-1">140 Points</div>
                    <div class="text-sm text-muted-foreground">20 points per boss</div>
                </div>
                <div class="p-4 rounded-lg border bg-card hover:shadow-md transition-all">
                    <div class="text-lg font-medium">Riftstone Events</div>
                    <div class="text-2xl font-bold text-primary mt-1">50 Points</div>
                    <div class="text-sm text-muted-foreground">Raid participation</div>
                </div>
                <div class="p-4 rounded-lg border bg-card hover:shadow-md transition-all">
                    <div class="text-lg font-medium">Siege Events</div>
                    <div class="text-2xl font-bold text-primary mt-1">50 Points</div>
                    <div class="text-sm text-muted-foreground">Tax & Castle sieges</div>
                </div>
            </div>
        </div>

        <!-- Bidding System -->
        <div class="mb-8">
            <h3 class="text-xl font-semibold mb-4">Bidding System</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="p-4 rounded-lg border bg-primary/5">
                    <div class="font-semibold mb-2">Wishlist Items</div>
                    <div class="text-2xl font-bold">250 Points</div>
                    <div class="text-sm text-muted-foreground mt-1">Minimum bid required</div>
                </div>
                <div class="p-4 rounded-lg border bg-primary/5">
                    <div class="font-semibold mb-2">Expensive Items</div>
                    <div class="text-2xl font-bold">150 Points</div>
                    <div class="text-sm text-muted-foreground mt-1">Limited to 1 per week</div>
                </div>
                <div class="p-4 rounded-lg border bg-primary/5">
                    <div class="font-semibold mb-2">Regular Items</div>
                    <div class="text-2xl font-bold">70 Points</div>
                    <div class="text-sm text-muted-foreground mt-1">Standard items</div>
                </div>
            </div>
        </div>

        <!-- Key Rules -->
        <div class="mb-8">
            <h3 class="text-xl font-semibold mb-4">Key Rules</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-3">
                    <div class="flex items-start gap-2">
                        <div class="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                        <p>All boss items are stored in the Guild House</p>
                    </div>
                    <div class="flex items-start gap-2">
                        <div class="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                        <p>Items are auctioned for 2 days in Discord</p>
                    </div>
                    <div class="flex items-start gap-2">
                        <div class="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                        <p>Wishlist items have priority in bidding</p>
                    </div>
                </div>
                <div class="space-y-3">
                    <div class="flex items-start gap-2">
                        <div class="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                        <p>Maximum 2 active wishlist items per player</p>
                    </div>
                    <div class="flex items-start gap-2">
                        <div class="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                        <p>Expensive items (500+ Lucent) limited to 1 per week</p>
                    </div>
                    <div class="flex items-start gap-2">
                        <div class="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                        <p>Unclaimed world boss weapons sold for lucent</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Important Notes -->
        <div class="rounded-lg border p-4 bg-muted">
            <h3 class="text-lg font-semibold mb-2">Additional Information</h3>
            <div class="space-y-2 text-sm">
                <p>• Riftstone Bosses: Daily at 21:30 GMT+2 (20:00 GMT+2 during attacks)</p>
                <p>• Tie-breakers resolved with die rolls</p>
                <p>• Wishlist items have priority over regular bidding</p>
            </div>
        </div>
    </CardContent>
</Card>

</div>
