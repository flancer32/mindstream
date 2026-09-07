// @ts-check
/** @namespace Mindstream_Back_Cli_Ingest_Import */
export default class Mindstream_Back_Cli_Ingest_Import {
  /**
   * @param {object} deps
   * @param {Mindstream_Back_Ingest_Import$} deps.importPublication
   * @param {typeof import('node:fs/promises')} deps.files
   */
  constructor({ importPublication, files }) {
    this.id = 'ingest:import';
    this.summary = 'Import one prepared publication from a local JSON file.';
    this.lifetime = 'finite';
    this.arguments = [{name: 'file', kind: 'string', required: true, description: 'Publication JSON file.'}];
    this.options = [];
    /** @param {{args: {file: string}}} context */
    this.execute = async function ({args}) {
      const file = await files.open(args.file, 'r');
      try {
        const stat = await file.stat();
        if (!stat.isFile() || stat.size > 2_000_000) throw new Error('Import requires a regular JSON file of at most 2 MB.');
        const content = await file.readFile({encoding: 'utf8'});
        await importPublication.execute(JSON.parse(content));
      } finally {
        await file.close();
      }
    };
  }
}

export const __deps__ = Object.freeze({default: {
  importPublication: 'Mindstream_Back_Ingest_Import$',
  files: 'node:fs/promises',
}});
