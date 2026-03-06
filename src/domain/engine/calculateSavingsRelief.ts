import { TimelineEvent } from "../types/forecast";
//iterate through the timeline
//find the point where the running balance becomes negative or is minimum
//check if it is greater than or equal to buffer, if yes, return null
//if no, then gather all events that led up to this minevent and have the type commitment
//pick the most largest commitment
//reliefAMount = abs(minEvent.runningBalance) + buffer
//if reliefAMount > targetCommitment.amount, reliefAMount = targetCommitment.amount
