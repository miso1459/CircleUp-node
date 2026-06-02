<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Toaster } from '$lib/components/ui/sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';

	const { data } = $props();

	function getInitialProfile() {
		return { name: data.user.name, lang: data.user.lang };
	}

	const initial = getInitialProfile();
	let name = $state(initial.name);
	let lang = $state(initial.lang);

	function handleSuccess() {
		toast.success(m.profile_saved());
	}
</script>

<Toaster />
<div class="relative flex min-h-[80dvh] items-center justify-center p-4">
	<!-- Background gradient orbs -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden">
		<div class="absolute -left-32 -top-32 size-96 rounded-full bg-primary/5 blur-3xl"></div>
		<div class="absolute -bottom-32 -right-32 size-96 rounded-full bg-primary/8 blur-3xl"></div>
	</div>

	<Card class="relative w-full max-w-md rounded-2xl border-border/50 shadow-sm">
		<CardHeader class="items-center gap-3 pb-2">
			<div class="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
				{name?.charAt(0)?.toUpperCase() ?? '?'}
			</div>
			<CardTitle class="text-xl font-bold tracking-tight">{m.profile_title()}</CardTitle>
		</CardHeader>
		<CardContent class="pt-4">
			<form
				method="POST"
				action="?/updateProfile"
				use:enhance={({ formData }) => {
					const newName = formData.get('name') as string;
					const newLang = formData.get('lang') as string;
					name = newName;
					lang = newLang;
					return async ({ result }) => {
						if (result.type === 'success' && result.data?.success) {
							handleSuccess();
						}
					};
				}}
			>
				<div class="grid gap-5">
					<div class="grid gap-2">
						<Label for="name" class="text-sm font-medium">{m.profile_name()}</Label>
						<Input
							id="name"
							name="name"
							type="text"
							bind:value={name}
							required
							class="h-11 rounded-lg"
						/>
					</div>
					<div class="grid gap-2">
						<Label for="lang" class="text-sm font-medium">{m.profile_lang()}</Label>
						<Select type="single" bind:value={lang}>
							<SelectTrigger id="lang" class="h-11 w-full rounded-lg">
								{lang === 'ko' ? '한국어' : 'English'}
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ko">한국어</SelectItem>
								<SelectItem value="en">English</SelectItem>
							</SelectContent>
						</Select>
						<input type="hidden" name="lang" value={lang} />
					</div>
					<Button type="submit" class="mt-2 h-11 w-full rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
						{m.profile_save()}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
