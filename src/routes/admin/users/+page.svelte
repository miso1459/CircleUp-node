<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';

	let { data } = $props();

	interface UserEdit {
		role: string;
		lang: string;
	}

	// Track only the edits (diffs from server data), initialized from props
	let edits = $state<Record<string, UserEdit>>({});

	// Initialize edits in $effect – avoids state_unsafe_mutation from template mutation
	$effect(() => {
		const next: Record<string, UserEdit> = {};
		for (const u of data.users) {
			next[u.id] = { role: u.role, lang: u.lang };
		}
		edits = next;
	});

	const roleOptions = ['admin', 'user'];
	const langOptions = ['ko', 'en'];
</script>

<div class="space-y-6">
	<h2 class="text-2xl font-semibold">{m.admin_users_title()}</h2>

	<Table>
		<TableHeader>
			<TableRow>
				<TableHead>{m.admin_users_email()}</TableHead>
				<TableHead>{m.admin_users_name()}</TableHead>
				<TableHead>{m.admin_users_role()}</TableHead>
				<TableHead>{m.admin_users_lang()}</TableHead>
				<TableHead class="w-32"></TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			{#each data.users as user (user.id)}
				{@const edit = edits[user.id] ?? { role: user.role, lang: user.lang }}
				<TableRow>
					<TableCell class="font-medium">
						{user.email}
					</TableCell>
					<TableCell>{user.name}</TableCell>
					<TableCell>
						<div class="flex items-center gap-2">
							<Badge
								variant={user.role === 'admin' ? 'default' : 'secondary'}
								class="hidden sm:inline-flex"
							>
								{user.role}
							</Badge>
							<Select
								type="single"
								value={edit.role}
								onValueChange={(v: string) => {
									edit.role = v;
								}}
							>
								<SelectTrigger class="w-28">
									{edit.role}
								</SelectTrigger>
								<SelectContent>
									{#each roleOptions as role (role)}
										<SelectItem value={role}>{role}</SelectItem>
									{/each}
								</SelectContent>
							</Select>
						</div>
					</TableCell>
					<TableCell>
						<Select
							type="single"
							value={edit.lang}
							onValueChange={(v: string) => {
								edit.lang = v;
							}}
						>
							<SelectTrigger class="w-20">
								{edit.lang}
							</SelectTrigger>
							<SelectContent>
								{#each langOptions as lang (lang)}
									<SelectItem value={lang}>{lang}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</TableCell>
					<TableCell>
						<form method="POST" action="?/updateUser">
							<input type="hidden" name="userId" value={user.id} />
							<input type="hidden" name="name" value={user.name} />
							<input type="hidden" name="role" value={edit.role} />
							<input type="hidden" name="lang" value={edit.lang} />
							<Button type="submit" size="sm">
								{m.admin_users_save()}
							</Button>
						</form>
					</TableCell>
				</TableRow>
			{/each}
		</TableBody>
	</Table>
</div>
