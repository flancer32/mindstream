# Mindstream — Content Collection Flows

- Path: `ctx/docs/architecture/data-flow/content-collection.md`
- Template Version: `20260619`
- Changed: `20260619`

## Purpose

This document defines **Content Collection flows** in the Mindstream MVP.

Content Collection flows are the server-side data flows by which the technical set of publications and their derived representations is formed and maintained for use by all reading contexts.

This document describes only Content Collection flows and does not cover Attention flows or browser-side computational loops.

---

## Architectural Position

Content Collection flows run exclusively on the server side and form the canonical Content Collection state.

These flows:

- do not depend on anonymous identity;
- do not depend on attention signals;
- have no feedback loops with browser contours;
- do not model “reality,” but record a technical set of publications.

A publication is treated as the atomic artifact of the Content Collection.

---

## General Structure Of Content Collection Flows

Within the MVP, Content Collection flows form this sequence:

`ingestion → content processing → storage`

---

## Ingestion

(`Publication Sources → Ingestion`)

**Purpose**: obtain publications from external sources and form an internal text representation suitable for further processing.

**Invariants**

- the flow is initiated only by a server contour;
- a publication is either accepted as a whole or excluded from the Content Collection;
- the flow result does not depend on the browser context.

---

## Content Processing

(`Ingestion → Content Processing`)

**Purpose**: create the derived publication representations required for read models and further use.

**Invariants**

- derived representations are formed as algorithmic projections of the prepared publication text;
- the process does not depend on attention signals;
- reprocessing the same publication is not allowed in the MVP.

---

## Storage

(`Content Processing → Storage`)

**Purpose**: store the results of Content Collection flows in canonical storage.

**Stored Data**

- publications and their internal representations;
- derived representations such as annotation and overview;
- embeddings derived from those representations.

**Invariants**

- storage state is canonical with respect to all contexts;
- stored data is not reactively changed in response to attention;
- updates to the Content Collection are allowed only as the result of server-side formation flows.

---

## Constraints

Content Collection flows do not define read/write APIs, transport formats, or implementation mechanisms for executing the flows.

---

## Summary

This document defines Mindstream Content Collection flows as a closed server-side sequence `ingestion → content processing → storage` that forms the canonical technical set of publications without participation of anonymous identity, without dependence on attention, and without global reactivity in the MVP.
