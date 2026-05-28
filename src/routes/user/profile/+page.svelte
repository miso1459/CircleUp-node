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
<div class="flex min-h-screen items-center justify-center p-4">
	<Card class="w-full max-w-md">
		<CardHeader>
			<CardTitle>{m.profile_title()}</CardTitle>
		</CardHeader>
		<CardContent>
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
				<div class="grid gap-4">
					<div class="grid gap-2">
						<Label for="name">{m.profile_name()}</Label>
						<Input
							id="name"
							name="name"
							type="text"
							bind:value={name}
							required
						/>
					</div>
					<div class="grid gap-2">
						<Label for="lang">{m.profile_lang()}</Label>
						<Select type="single" bind:value={lang}>
							<SelectTrigger id="lang" class="w-full">
								{lang === 'ko' ? '한국어' : 'English'}
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ko">한국어</SelectItem>
								<SelectItem value="en">English</SelectItem>
							</SelectContent>
						</Select>
						<input type="hidden" name="lang" value={lang} />
					</div>
					<Button type="submit">{m.profile_save()}</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
