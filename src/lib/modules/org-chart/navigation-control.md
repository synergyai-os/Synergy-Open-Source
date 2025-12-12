# Org Chart Navigation Control

Simple navigation model for org chart.

## Core Concept

**Always have an 'active circle'** - one circle is always marked as active (highlighted).

## Rules

1. **On page load**: Root circle = active
2. **Click a circle**:
   - If NOT active → Make it active and zoom to it
   - If IS active → Open modal (circle details)
3. **Click role in active circle** → Open modal (role details)
4. **Click outside active circle** → Zoom view to show active circle

## Use Cases

### Initial Load

- Root circle is active (highlighted)
- View shows full chart
- No modal opens

### Click Non-Active Circle

- Circle becomes active
- Zoom to frame the circle
- No modal opens

### Click Active Circle

- Open modal with circle details
- Circle remains active

### Click Role in Active Circle

- Open modal with role details
- Circle remains active

### Click Background

- Zoom view to show active circle
- Active circle unchanged
