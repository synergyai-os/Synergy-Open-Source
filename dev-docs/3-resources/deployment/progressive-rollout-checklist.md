# Progressive Rollout Checklist

**Use this checklist for every new feature rollout.**

---

## Pre-Rollout: Development Phase

### Code Implementation

- [ ] Feature code complete
- [ ] Feature wrapped in flag check
- [ ] Flag constant added to `src/lib/infrastructure/feature-flags/constants.ts`
- [ ] Flag defaults to `false`
- [ ] Error boundary wraps component
- [ ] PostHog events added for key actions
- [ ] Types pass (`npm run check`)
- [ ] Linter passes (`npm run lint`)

### Testing

- [ ] Tested locally with flag enabled
- [ ] Tested locally with flag disabled (graceful degradation)
- [ ] Browser console clean (no errors)
- [ ] PostHog events firing correctly

### Documentation

- [ ] PR description complete
- [ ] Linear issue updated
- [ ] Feature flag documented (if complex targeting)

### Deployment

- [ ] PR merged to `main`
- [ ] GitHub Actions passed (Convex deployed)
- [ ] Vercel deployment succeeded
- [ ] Flag created in Convex database (disabled)

---

## Phase 1: Developer Only (Day 1)

### Enable for Self

- [ ] Flag enabled for your user ID only
- [ ] Verified flag working in production

### Testing (1+ hour)

- [ ] All user flows tested with real data
- [ ] Edge cases explored
- [ ] Performance acceptable
- [ ] Browser console clean
- [ ] PostHog events captured correctly

### Monitoring

- [ ] Zero errors in PostHog
- [ ] No performance degradation
- [ ] Feature behaves as expected

**Decision Point**: ✅ Continue to Phase 2 or 🔧 Fix issues first

---

## Phase 2: Team Testing (Day 2-3)

### Enable for Team

- [ ] Flag enabled for team domain
- [ ] Team notified (Slack/email)
- [ ] Testing guidelines shared

### Team Feedback (1-2 days)

- [ ] At least 3 team members tested
- [ ] Feedback collected (Linear/Slack)
- [ ] Critical bugs identified and fixed
- [ ] UX issues addressed

### Monitoring

- [ ] Error rate < 0.1%
- [ ] No performance issues reported
- [ ] PostHog session replays reviewed
- [ ] User flows completing successfully

**Decision Point**: ✅ Continue to Phase 3 or 🔧 Address issues

---

## Phase 3: Beta Users (Week 1, Optional)

### Enable for Beta

Choose one:

- [ ] **Option A**: Percentage rollout (5-10%)
- [ ] **Option B**: Opt-in users only

### Monitoring (Daily)

- [ ] Error rate compared to baseline
- [ ] User feedback gathered
- [ ] Session replays reviewed
- [ ] Support tickets checked

### Metrics to Track

- [ ] Feature adoption rate (% of enabled users who use it)
- [ ] Completion rate (% who finish flow)
- [ ] Error rate (vs baseline)
- [ ] Performance (vs baseline)

**Decision Point**: ✅ Continue to Phase 4 or 🔧 Iterate based on feedback

---

## Phase 4: Gradual Rollout (Week 2)

### Day 1: 5% Rollout

- [ ] Percentage set to 5%
- [ ] Monitor for 24 hours
- [ ] Error rate acceptable (< 0.1% increase)
- [ ] No critical issues reported

### Day 2: 10% Rollout

- [ ] Percentage increased to 10%
- [ ] Monitor for 24 hours
- [ ] Error rate stable
- [ ] Performance metrics stable

### Day 3: 25% Rollout

- [ ] Percentage increased to 25%
- [ ] Monitor for 24 hours
- [ ] Support tickets reviewed
- [ ] User feedback positive

### Day 4: 50% Rollout

- [ ] Percentage increased to 50%
- [ ] Monitor for 24 hours
- [ ] Large-scale performance validated
- [ ] No scaling issues

### Day 5: 100% Rollout

- [ ] Percentage increased to 100%
- [ ] Monitor for 48+ hours
- [ ] All users have access
- [ ] No major issues

**Emergency Rollback**: If error rate spikes at any %, immediately:

```typescript
await toggleFlag({ flag: 'feature_name', enabled: false });
```

---

## Phase 5: Stabilization (Week 3-4)

### Monitor at 100%

- [ ] 2 weeks at 100% with no issues
- [ ] Error rate baseline (not increasing)
- [ ] User feedback stabilized
- [ ] No outstanding critical bugs

### Prepare Flag Removal

- [ ] Create cleanup issue in Linear
- [ ] Document old code to remove
- [ ] Schedule flag removal PR

### Remove Flag

- [ ] Create PR to remove flag
- [ ] Remove flag checks from code
- [ ] Make new code the default path
- [ ] Delete old code (if completely replaced)
- [ ] Remove flag from database
- [ ] Delete flag constant from featureFlags.ts
- [ ] Deploy and monitor

**Done!** 🎉 Feature fully rolled out and flag removed.

---

## Rollback Playbook

### When to Rollback

**Immediate (< 1 min)**:

- Error rate spike > 1%
- Critical feature broken
- Data loss potential
- Security issue

**Scheduled (within 1 hour)**:

- Non-critical bugs affecting users
- Performance degradation
- Unexpected behavior

**No Rollback Needed**:

- UI polish issues
- Non-blocking bugs
- Edge case issues

### How to Rollback

**Step 1: Disable Flag**

```typescript
// In Convex function runner
await toggleFlag({
	flag: 'problematic_feature',
	enabled: false
});
```

**Step 2: Verify**

- [ ] Error rate drops (PostHog)
- [ ] Users getting old version
- [ ] New errors stopped

**Step 3: Communicate**

- [ ] Update Linear issue
- [ ] Notify team (Slack)
- [ ] Document issue for fix

**Step 4: Fix**

- [ ] Identify root cause
- [ ] Fix bug locally
- [ ] Test thoroughly
- [ ] Deploy fix

**Step 5: Re-enable**

- [ ] Start at 5% again
- [ ] Monitor closely
- [ ] Increase gradually

---

## Monitoring Dashboard

### Create in PostHog

**Feature Flag Dashboard** (per flag):

1. **Evaluation Count** - `feature_flag_checked` events
2. **Enabled Rate** - % where `enabled = true`
3. **Feature Usage** - `feature_used` events
4. **Error Rate** - `error_occurred` filtered by `feature_flag`
5. **Error Distribution** - Group errors by `error_name`

**Rollout Metrics** (during rollout):

1. **Percentage Rollout** - Current percentage
2. **Users Affected** - Distinct user count
3. **Error Rate vs Baseline** - Compare to pre-rollout
4. **User Satisfaction** - Feedback/support tickets

---

## Communication Templates

### Team Notification (Phase 2)

```
🧪 Feature Testing: [Feature Name]

We've enabled [feature name] for the team. Please test and provide feedback!

**What to test:**
- [Flow 1]
- [Flow 2]
- [Edge case]

**How to provide feedback:**
- Comment on Linear: SYN-XXX
- Report bugs immediately in Slack

**Timeline:**
- Testing until [date]
- Rolling out to users next week

Thanks! 🙏
```

### Rollback Notification

```
🔄 Rollback: [Feature Name]

We've temporarily disabled [feature name] due to [issue].

**Impact:**
- Users see previous version
- No data loss
- Issue being investigated

**Next steps:**
- Fix deployed by [time/date]
- Re-enable gradually
- Monitor closely

Will update when resolved.
```

---

## Success Criteria

### Metrics to Hit

**Before 100% Rollout**:

- Error rate increase < 0.1%
- Feature adoption > 50% of enabled users
- Completion rate > 80% for key flows
- Support tickets < 1% of users
- Positive user feedback

**For Flag Removal**:

- 2+ weeks at 100%
- Error rate stable
- No outstanding critical bugs
- Team confident in feature

---

## Quick Reference

### Check Flag Status

```typescript
await getFlag({ flag: 'feature_name' });
```

### Update Percentage

```typescript
await updateRollout({ flag: 'feature_name', percentage: 25 });
```

### Disable Flag

```typescript
await toggleFlag({ flag: 'feature_name', enabled: false });
```

### Monitor in PostHog

```
Filter events:
- feature_flag = "feature_name"
- Group by: day
- Compare to baseline
```

---

## Further Reading

- [Feature Flags Pattern](../2-areas/patterns/feature-flags.md)
- [Deployment Procedures](./deployment-procedures.md)
- [Error Handling & Monitoring](./error-handling-monitoring.md)
- [Git Workflow Guide](./git-workflow.md)
