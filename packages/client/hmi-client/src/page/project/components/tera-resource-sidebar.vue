<template>
	<nav>
		<header>
			<Button icon="pi pi-file-edit" class="p-button-icon-only p-button-text p-button-rounded" />
			<Button icon="pi pi-folder" class="p-button-icon-only p-button-text p-button-rounded" />
			<Button
				icon="pi pi-sort-amount-down"
				class="p-button-icon-only p-button-text p-button-rounded"
			/>
			<Button icon="pi pi-arrows-v" class="p-button-icon-only p-button-text p-button-rounded" />
			<Button
				icon="pi pi-trash"
				class="p-button-icon-only p-button-text p-button-rounded"
				@click="removeAsset"
			/>
		</header>
		<Tree :value="resources" selectionMode="single" v-on:node-select="openAsset">
			<template #default="slotProps">
				{{ slotProps.node.label }}
				<Chip :label="slotProps.node.data.assetType" />
			</template>
		</Tree>
	</nav>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
// import { logger } from '@/utils/logger';
import { isEmpty } from 'lodash';
import { IProject, ProjectAssetTypes } from '@/types/Project';
import { deleteAsset } from '@/services/project';
import { RouteName } from '@/router/routes';
import useResourcesStore from '@/stores/resources';
import { useRouter } from 'vue-router';
import Tree from 'primevue/tree';
import Button from 'primevue/button';
import Chip from 'primevue/chip';
import { DocumentAsset } from '@/types/Document';
import { Model } from '@/types/Model';
import { Dataset } from '@/types/Dataset';

const router = useRouter();
const resourcesStore = useResourcesStore();

const chosenAsset = ref({ assetId: -1, assetType: ProjectAssetTypes.DOCUMENTS });

defineProps<{
	project: IProject | null;
}>();

const resources = computed(() => {
	const storedAssets = resourcesStore.activeProjectAssets ?? [];
	const projectAssetTypes = Object.keys(storedAssets);
	const resourceTreeNodes: any[] = [];

	// console.log(storedAssets);

	if (!isEmpty(storedAssets)) {
		for (let i = 0; i < projectAssetTypes.length; i++) {
			const assets: (DocumentAsset & Model & Dataset)[] =
				Object.values(storedAssets[projectAssetTypes[i]]) ?? [];
			for (let j = 0; j < assets.length; j++) {
				resourceTreeNodes.push({
					key: assets[j]?.name || assets[j]?.title,
					label: assets[j]?.name || assets[j]?.title || assets[j]?.id,
					data: {
						assetType: projectAssetTypes[i],
						assetId:
							projectAssetTypes[i] === ProjectAssetTypes.DOCUMENTS
								? assets[j].xdd_uri
								: assets[j]?.id
					},
					selectable: true
				});
			}
		}
	}
	return resourceTreeNodes;
});

// Remove an asset - will be adjusted later
function removeAsset() {
	const storedAssets = resourcesStore.activeProjectAssets ?? [];
	const { assetId, assetType } = chosenAsset.value;

	const asset = storedAssets[assetType].find((a) =>
		assetType === ProjectAssetTypes.DOCUMENTS ? a.xdd_uri === assetId : a.id === assetId
	);

	console.log(chosenAsset.value, asset, storedAssets[assetType]);

	if (asset === undefined) {
		console.error('Failed to remove asset');
		return;
	}
	// remove the document from the project assets
	if (resourcesStore.activeProject && storedAssets) {
		deleteAsset(resourcesStore.activeProject.id, assetType, asset.id);

		storedAssets[assetType] = storedAssets[assetType].filter(({ id }) => id !== asset.id);

		// Remove also from the local cache - TO DO
		// resourcesStore.activeProject.assets[assetType] =
		// 	resourcesStore.activeProject.assets[assetType].filter(
		// 		(docId) => docId !== asset.id
		// 	);
	}

	// if the user deleted the currently selected asset, then clear its content from the view TO DO
	// if (asset.xdd_uri === documentId.value) {
	// 	router.push('/document'); // clear the doc ID as a URL param
	// }

	// look at model-sidebar-panel.vue in previous versions if you want to see about using the old tab system
}

function openAsset(event: any) {
	chosenAsset.value = {
		assetId: event.data.assetId,
		assetType: event.data.assetType
	};

	router.push({
		name: RouteName.ProjectRoute,
		params: {
			resourceName: event.key,
			assetId: event.data.assetId,
			assetType: event.data.assetType
		}
	});
}

// function exportIds() {
// 	logger.info(
// 		'List of xDD _gddid ',
// 		{},
// 		documents.value.map((document) => document)
// 	);
// }
</script>

<style scoped>
nav {
	display: flex;
	flex-direction: column;
	margin: 0.75rem;
	margin-top: 0;
	gap: 1rem;
}

.p-chip {
	padding: 0 0.5rem;
	border-radius: 0.5rem;
	text-transform: uppercase;
}

.p-tree:deep(.p-treenode-label) {
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
}
</style>
