SET LOCAL lock_timeout = '10s';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_extension
    WHERE extname = 'vector' AND extnamespace = 'public'::regnamespace
  ) THEN
    RAISE EXCEPTION 'pgvector must be installed in public';
  END IF;
END
$$;

DROP TABLE public.anonymous_identities,
  public.attention_states,
  public.publication_embeddings,
  public.publication_extractions,
  public.publication_sources,
  public.publication_summaries,
  public.publications,
  public.schema_version RESTRICT;

ALTER TABLE mindstream_data.dem_snapshot SET SCHEMA public;
ALTER TABLE mindstream_data.dem_application SET SCHEMA public;
ALTER TABLE mindstream_data.mindstream_source SET SCHEMA public;
ALTER TABLE mindstream_data.mindstream_publication SET SCHEMA public;
ALTER TABLE mindstream_data.mindstream_extraction SET SCHEMA public;
ALTER TABLE mindstream_data.mindstream_summary SET SCHEMA public;
ALTER TABLE mindstream_data.mindstream_embedding SET SCHEMA public;
ALTER TABLE mindstream_data.mindstream_identity SET SCHEMA public;
ALTER TABLE mindstream_data.mindstream_attention SET SCHEMA public;

DROP SCHEMA mindstream_data RESTRICT;
