# Checkpoint - Human Verification Required

Request human verification for critical milestone: $ARGUMENTS

## Checkpoint Process

<Task>
<Agent role="checkpoint-coordinator">
When reaching a critical milestone or completing a significant feature:

1. **Summarize What Was Done**
   - List completed tasks with specific details
   - Show key files created/modified
   - Highlight important decisions made
   - Note any deviations from plan

2. **Request Human Verification**
   ```
   🛑 CHECKPOINT: Human Verification Required
   
   IFLA-Platform - I've completed [$ARGUMENTS] and need your verification:
   
   ✅ What I've Accomplished:
   - [Specific task 1 with details]
   - [Specific task 2 with details]
   - [Specific task 3 with details]
   
   🧪 Please Test These Steps:
   1. [Specific test instruction with commands]
   2. [Another specific test with expected outcome]
   3. [Third verification step]
   
   📋 Critical Verification Points:
   - [ ] [Specific checkpoint 1]
   - [ ] [Specific checkpoint 2]
   - [ ] [Specific checkpoint 3]
   - [ ] Data integrity maintained
   - [ ] No breaking changes to existing functionality
   
   ⚠️ Important Notes:
   - [Any critical information about the implementation]
   - [Potential risks or considerations]
   
   Please respond:
   - ✅ "Approved" - Continue to next task
   - ❌ "Issues: [description]" - Fix issues before proceeding  
   - ❓ "Question: [question]" - Answer then wait for approval
   ```

3. **Wait for Human Response**
   - Don't proceed until explicit approval
   - Be ready to fix any issues identified
   - Answer questions thoroughly
   - Adjust approach based on feedback

4. **Document Verification**
   Update Implementation.md with:
   - Checkpoint timestamp and milestone
   - What was verified and approved
   - Any issues found and resolved
   - Human approval confirmation
   - Next steps agreed upon
</Agent>
</Task>

Remember: Critical milestones require human oversight for IFLA-Platform success.