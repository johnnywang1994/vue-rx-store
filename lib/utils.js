import {
  Observable,
  Subject,
  BehaviorSubject
} from 'rxjs';

const isObservableKey = key => key in Observable;

const isSubjectKey = key => key in Subject;

const isBehaviorSubjectKey = key => key in BehaviorSubject;

export const isFn = v => typeof v === 'function';

export const isObject = v => typeof v === 'object' && v !== null;

export const checkKeyValid = key => {
  const checkList = [
    isObservableKey(key),
    isSubjectKey(key),
    isBehaviorSubjectKey(key),
  ];
  return checkList.every(b => b === false);
};
