<script>
</script>

<h2 class="h2">Neues Objekte anlegen</h2>

<br />

<form method="POST" action="?/new">
	<label class="label">
		<span>Typ</span>
		<select class="select" size="2" value="1" name="type">
			<option value="store">Laden</option>
			<option value="category">Kategorie</option>
		</select>
	</label>

	<label class="label">
		<span>Name</span>
		<input class="input" type="text" placeholder="Apfel" name="name" />
	</label>

	<br />

	<div class="flex justify-between">
		<button class="btn variant-filled-success">Speichern</button>

		<a href="/more">
			<button class="btn variant-filled-warning">Abbrechen</button>
		</a>
	</div>
</form>
