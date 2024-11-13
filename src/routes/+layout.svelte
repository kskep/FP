<script>
    import '../app.css';
    import { page } from '$app/stores';
    import { cn } from "$lib/utils";
    import { Button } from "$lib/components/ui/button";
    import {
        Home,
        Users,
        ListTodo,
        Calendar,
        Settings,
        Menu,
        Shell,

        Shell

    } from 'lucide-svelte';

    let isOpen = true; // For mobile toggle

    const navigation = [
        {
            name: 'Dashboard',
            href: '/',
            icon: Home,
        },
        {
            name: 'Members',
            href: '/members',
            icon: Users,
        },
        {
            name: 'Wishlist',
            href: '/wishlist',
            icon: ListTodo,
        },
        {
            name: 'Raids',
            href: '/raids',
            icon: Shell,
        },

    ];
</script>

<div class="min-h-screen">
    <!-- Mobile menu button -->
    <div class="lg:hidden fixed top-0 left-0 w-full bg-background border-b p-4 z-50">
        <Button
            variant="outline"
            size="icon"
            on:click={() => isOpen = !isOpen}
        >
            <Menu class="h-4 w-4" />
        </Button>
    </div>

    <!-- Sidebar -->
    <aside class={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background transition-transform",
        !isOpen && "-translate-x-full",
        "lg:translate-x-0"
    )}>
        <div class="flex h-full flex-col">
            <!-- Guild Logo/Name -->
            <div class="border-b p-4">
                <h1 class="text-xl font-bold">Guild Name</h1>
                <p class="text-sm text-muted-foreground">T&L Guild Manager</p>
            </div>

            <!-- Navigation -->
            <nav class="flex-1 space-y-1 p-4">
                {#each navigation as item}
                    <a
                        href={item.href}
                        class={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                            $page.url.pathname === item.href
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        <svelte:component this={item.icon} class="h-4 w-4" />
                        {item.name}
                    </a>
                {/each}
            </nav>


        </div>
    </aside>

    <!-- Main Content -->
    <main class={cn(
        "min-h-screen transition-all",
        "lg:ml-64" // Margin for sidebar on large screens
    )}>
        <div class="container p-4 pt-20 lg:pt-4">
            <slot />
        </div>
    </main>
</div>
