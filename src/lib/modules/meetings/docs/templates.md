# Meetings Module - Templates

This document describes meeting templates and their step configuration.

## Meeting Templates

- **Meeting Templates** - User-created reusable meeting structures
  - Workspace-level templates (created by users with RBAC permissions)
  - Built using meeting types (templates reference a meeting type)
  - Can be created by roles/circles with appropriate RBAC access
  - Used to create meetings with predefined structure and steps
  - Default templates (Governance, Weekly Tactical) seeded on workspace creation but may be edited and adjusted by users with access rights.

## Meeting Template Steps

- **Meeting Template Steps** - Ordered agenda steps for templates
  - Step types: `check-in`, `agenda`, `metrics`, `projects`, `closing`, `custom`
  - Has title, optional description, order index, optional timebox
  - Defined by users when creating/editing templates

## Predefined Step Types

System provides the following step types:

- **`check-in`** - Opening round, attendance tracking
- **`agenda`** - Process agenda items, take notes, create action items
- **`metrics`** - Review metrics
- **`projects`** - Project updates
- **`closing`** - Recap action items and next steps
- **`custom`** - Custom step defined by user

## Essential Core Steps

Most meetings include these three essential steps:

- **Check-in** - Opening round, attendance tracking
- **Agenda** - Process agenda items, take notes, create action items
- **Closing** - Recap action items and next steps

## Additional Steps

Meetings can have more steps based on:

- Meeting template (templates define which steps to include)
- Meeting type (different types may require different step sequences)
- Custom steps (users can add custom steps to templates)

## Step Configuration

- Steps are defined in meeting templates
- Steps can be customized per meeting
- Steps guide meeting structure (not copied directly when creating meeting from template)
