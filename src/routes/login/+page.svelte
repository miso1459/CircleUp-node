<script lang="ts">
	import { createAuthClient } from 'better-auth/svelte';
	import * as m from '$lib/paraglide/messages';
	import { toast } from 'svelte-sonner';
	import { Toaster } from '$lib/components/ui/sonner';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';

	const authClient = createAuthClient();

	let isLoading = $state(false);

	type SocialProvider = {
		id: string;
		label: string;
		isDummy: boolean;
	};

	const socialProviders: SocialProvider[] = [
		{ id: 'github', label: m.auth_social_github(), isDummy: false },
		{ id: 'google', label: m.auth_social_google(), isDummy: false },
		{ id: 'naver', label: m.auth_social_naver(), isDummy: true },
		{ id: 'apple', label: m.auth_social_apple(), isDummy: true },
		{ id: 'instagram', label: m.auth_social_instagram(), isDummy: true },
		{ id: 'tiktok', label: m.auth_social_tiktok(), isDummy: true }
	];

	async function handleSocialSignIn(provider: string) {
		isLoading = true;
		try {
			const { data, error } = await authClient.signIn.social({
				provider: provider as 'github' | 'google',
				callbackURL: '/'
			});
			if (data?.url) {
				window.location.href = data.url;
			} else if (error) {
				toast.error(error.message || m.common_error());
				isLoading = false;
			}
		} catch {
			toast.error(m.common_error());
			isLoading = false;
		}
	}

	function handleDummySocial() {
		toast.info(m.auth_social_coming_soon());
	}

	function onSocialClick(provider: SocialProvider) {
		if (provider.isDummy) {
			handleDummySocial();
		} else {
			handleSocialSignIn(provider.id);
		}
	}
</script>

<Toaster />
<div class="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
	<!-- Background gradient orbs -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden">
		<div class="absolute -left-32 -top-32 size-96 rounded-full bg-primary/5 blur-3xl"></div>
		<div class="absolute -bottom-32 -right-32 size-96 rounded-full bg-primary/8 blur-3xl"></div>
		<div class="absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl"></div>
	</div>

	<Card class="relative w-full max-w-sm rounded-2xl border-border/50 shadow-lg">
		<CardHeader class="items-center gap-3 pb-2">
			<div class="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="size-6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10" />
					<path d="M8 12h8" />
					<path d="M12 8v8" />
				</svg>
			</div>
			<div class="text-center">
				<CardTitle class="text-2xl font-bold tracking-tight">CircleUp</CardTitle>
				<p class="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
			</div>
		</CardHeader>
		<CardContent class="pt-4">
			<div class="grid grid-cols-2 gap-3">
				{#each socialProviders as provider (provider.id)}
					<Button
						variant="outline"
						class="h-11 w-full gap-2.5 border-border/60 transition-all duration-200 hover:bg-muted/80 hover:shadow-sm active:scale-[0.98]"
						disabled={isLoading}
						onclick={() => onSocialClick(provider)}
					>
						{#if provider.id === 'github'}
							<svg viewBox="0 0 24 24" fill="currentColor" class="size-4 shrink-0">
								<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
							</svg>
						{:else if provider.id === 'google'}
							<svg viewBox="0 0 24 24" class="size-4 shrink-0">
								<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
								<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
								<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
								<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
							</svg>
						{:else if provider.id === 'naver'}
							<span class="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#03C75A] text-[10px] font-bold text-white">N</span>
						{:else if provider.id === 'apple'}
							<svg viewBox="0 0 24 24" fill="currentColor" class="size-4 shrink-0">
								<path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
							</svg>
						{:else if provider.id === 'instagram'}
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="size-4 shrink-0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
								<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
								<line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
							</svg>
						{:else if provider.id === 'tiktok'}
							<svg viewBox="0 0 24 24" fill="currentColor" class="size-4 shrink-0">
								<path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.69 2.89 2.89 0 0 1-2.88-2.89 2.89 2.89 0 0 1 2.88-2.89c.38 0 .74.08 1.07.21V9.93a6.36 6.36 0 0 0-1.07-.1A6.34 6.34 0 0 0 3 16.17a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.99a8.27 8.27 0 0 0 4.59 1.47V6.99" />
							</svg>
						{/if}
						<span class="truncate">{provider.label}</span>
					</Button>
				{/each}
			</div>
		</CardContent>
	</Card>
</div>
