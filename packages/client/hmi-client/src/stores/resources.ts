import { defineStore } from 'pinia';
import { IProject, ProjectAssets } from '@/types/Project';

/**
 * Mainly to store all data resources in this project, e.g. datasets, documents, models, etc.
 */
const useResourcesStore = defineStore('resources', {
	state: () => ({
		xddDataset: null as string | null,
		activeProject: null as null | IProject,
		activeProjectAssets: null as ProjectAssets | null
	}),
	actions: {
		setXDDDataset(dataset: string | null) {
			this.xddDataset = dataset;
		},
		setActiveProject(project: null | IProject) {
			this.activeProject = project;
		},
		reset() {
			this.activeProject = null;
			this.activeProjectAssets = null;
		}
	}
});

export default useResourcesStore;
