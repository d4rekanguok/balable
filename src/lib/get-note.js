import { notes } from '~/lib/constants';

export const getNote = (value = 0, mode = 'simple') => {
	return notes[mode][value - 1];
};
