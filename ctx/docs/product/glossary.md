# Product Glossary

- Path: `ctx/docs/product/glossary.md`
- Template Version: `20260605`
- Changed: `20260619`

## Purpose

This document defines stable product terminology for Mindstream and replaces ad hoc naming drift across product, architecture, environment, and code documentation.

## Level Boundary

Defines:

- Stable product terms and preferred names.
- Terminology relations and ambiguity boundaries.
- Terminology-level invariants for project documentation.

Does NOT define:

- Storage identifiers, DTO names, or table names.
- API field names or transport-level labels.
- Source code identifiers or implementation naming conventions.

## Term Groups

- Corpus terms — publication, corpus, semantic representation, annotation, overview, embedding.
- Participation terms — user context, user profile, profile UUID, demo mode.
- Attention terms — attention signal, interest profile, interest vector, aggregated attention statistics.
- Projection terms — feed, similarity.
- Composition terms — interest indicator.

## Core Terms

**Publication**  
External text source aggregated by Mindstream. The full source text remains external to the product's canonical corpus model.

**Data Corpus**  
Shared product-wide set of publications, semantic representations, and derived semantic data.

**Demo Corpus**  
Restricted subset of the corpus available without profile initialization.

**Full Corpus**  
Complete corpus surface available only to a user with an initialized profile UUID.

**Demo Mode**  
Product mode without profile UUID and without server-side transmission of attention signals.

**User Context**  
One browser-bound context of Mindstream use.

**User Profile**  
Product entity that binds one user context to participation in the shared statistical contour.

**Profile UUID**  
Unique identifier of a user profile used for profile distinction and aggregated attention participation, not for registration or authentication.

**Semantic Representation**  
Canonical compressed meaning projection of a publication.

**Annotation**  
Lower-clarity semantic representation used for rapid initial orientation.

**Overview**  
Higher-clarity semantic representation used for deeper orientation before opening the original publication.

**Embedding**  
Vector representation of semantic meaning derived from annotation or overview.

**Attention Signal**  
Positive user interaction fact such as reading an annotation, reading an overview, opening the original publication, or explicitly marking a publication positively.

**Interest Profile**  
Product-level preference state of one user context.

**Interest Vector**  
Vector representation of user preference used for local feed formation.

**Aggregated Attention Statistics**  
Shared statistical product context derived from the attention signals of initialized profiles.

**Feed**  
Local personal projection of the corpus for one user context and not a shared global system object.

**Similarity**  
Numerical correspondence measure between semantic representations, user preference vectors, and shared attention statistics.

**Interest Indicator**  
User-visible vertical percentage indicator that shows the degree of correspondence between a publication and the current user's interests.

## Naming Principles

- Product terms are defined by product meaning, not by current implementation names.
- English labels are preferred across project documentation.
- New terms should be added only when they introduce distinct product meaning.
- Deprecated or ambiguous synonyms should be avoided once a preferred term is established.

## Terminology Relations

- Annotation and overview are kinds of semantic representation.
- Demo corpus and full corpus are modes of corpus availability, not separate products.
- User profile and profile UUID are related, but UUID is only the identifier of the profile.
- Interest profile, interest vector, and feed describe different layers of one personal projection model.
- Interest indicator is a UI projection of local publication scoring, not a separate product or architecture entity.

## Terminology Invariants

- Profile UUID must not be treated as an account, credential, or proof of real-world identity.
- Feed must not be treated as a globally owned durable object.
- Annotation and overview must not be described as editorial rewrites or user-authored summaries.

## Glossary Documentation Map

No deeper glossary documents are currently defined.
