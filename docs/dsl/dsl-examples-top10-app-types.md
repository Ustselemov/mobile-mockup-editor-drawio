# DSL Examples For Top-10 App Types

This document was generated with the assistance of Codex AI and prompted by Ustselemov.

## Example set

- `ecommerce-product-page.dsl`
- `ecommerce-checkout.dsl`
- `fintech-home.dsl`
- `fintech-transfer.dsl`
- `delivery-cart.dsl`
- `healthcare-results.dsl`
- `social-chat.dsl`
- `media-player.dsl`
- `travel-booking.dsl`
- `productivity-task-detail.dsl`
- `education-lesson.dsl`
- `services-booking.dsl`

## Example snippets

### E-commerce

```txt
screen ProductPage preset:iphone15
  header title:"Product"
  section Hero layout:vstack gap:12
    image placeholder:"product"
    text value:"Sony XM5"
    button variant:primary text:"Buy now"
```

### Fintech

```txt
screen Wallet preset:iphone15
  header title:"Wallet"
  section Actions layout:hstack gap:8
    button variant:secondary text:"Top up"
    button variant:primary text:"Transfer"
```

### Delivery

```txt
screen Checkout preset:iphone15
  section Address layout:vstack gap:8
    field label:"Address" value:"Yekaterinburg"
    segmentedControl items:["Delivery", "Pickup"]
```

### Healthcare

```txt
screen Results preset:iphone15
  section Cards layout:vstack gap:12
    card title:"Cardiology" subtitle:"Available today"
    button variant:primary text:"Book appointment"
```

### Social

```txt
screen Chat preset:iphone15
  header title:"Alex"
  section Messages layout:vstack gap:8
    chatBubble side:left text:"Hi"
    chatBubble side:right text:"Hello"
```

### Media

```txt
screen Player preset:iphone15
  section Player layout:vstack gap:10
    image placeholder:"cover"
    button variant:primary text:"Play"
```

### Travel

```txt
screen Booking preset:iphone15
  section Trip layout:vstack gap:8
    field label:"From" value:"Ekaterinburg"
    field label:"To" value:"Sochi"
```

### Productivity

```txt
screen TaskDetail preset:iphone15
  section Task layout:vstack gap:8
    text value:"Prepare release notes"
    checkbox text:"Done"
```

### Education

```txt
screen Lesson preset:iphone15
  section Lesson layout:vstack gap:10
    text value:"Introduction"
    button variant:primary text:"Start quiz"
```

### Services

```txt
screen Booking preset:iphone15
  section Provider layout:vstack gap:8
    card title:"Cleaner" subtitle:"From 699"
    button variant:primary text:"Book"
```

## Note

These examples define the target DSL coverage for MVP3. They are design inputs for parser and mapper work, not proof of current implementation.
