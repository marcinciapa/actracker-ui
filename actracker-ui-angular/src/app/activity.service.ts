import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { environment } from '../environments/environment';

import { Activity } from './activity';
import { ActivitiesResult } from './activitiesResult';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  constructor(
    private http: HttpClient,
  ) { }

  getActivities(): Observable<ActivitiesResult> {
    let url: string = `${environment.backendBaseUrl}/activity`;

    return this.http.get<ActivityPayload[]>(url)
      .pipe(
        map(response => this.toActivitiesResult(response)),
        catchError(() => {
          console.error('Error occurred during fetching activities');
          return [];
        })
      );
  }

  createActivity(activity: Activity): Observable<Activity> {
    let url: string = `${environment.backendBaseUrl}/activity`;
    let activityPayload = this.toActivityPayload(activity);

    return this.http.post<ActivityPayload>(url, activityPayload)
    .pipe(
      map(response => this.toActivity(response)),
      catchError(() => {
        console.error('Error occurred during activity creation');
        return []; // TODO [mc] What should I return here?
      })
    );
  }

  updateActivity(activity: Activity): Observable<Activity> {
    let url = `${environment.backendBaseUrl}/activity/${activity.id}`;
    let activityPayload = this.toActivityPayload(activity);

    return this.http.put(url, activityPayload).pipe(
      map(response => this.toActivity(response)),
      catchError(() => {
        console.error('Error occurred during fetching activity');
        return [];
      })
    )
  }

  toActivityPayload(activity: Activity): ActivityPayload {
    let activityPayload: ActivityPayload = {
      id: activity.id,
      startTimestamp: activity.startTime?.getTime(),
      endTimestamp: activity.endTime?.getTime(),
    }
    return activityPayload;
  }

  toActivitiesResult(activities: ActivityPayload[]): ActivitiesResult {
    let activitiesResult: ActivitiesResult = {
      activities: activities.map(this.toActivity)
    }
    return activitiesResult;
  }

  toActivity(activityPayload: ActivityPayload): Activity {
    let activity: Activity = {
      id: activityPayload.id,
      isSaved: true,
    }
    activity.startTime = activityPayload.startTimestamp ? new Date(activityPayload.startTimestamp) : undefined;
    activity.endTime = activityPayload.endTimestamp ? new Date(activityPayload.endTimestamp) : undefined;

    return activity;
  }
}

interface ActivityPayload {
  id?: string,
  startTimestamp?: number,
  endTimestamp?: number,
}

interface ActivitiesResultPayload {
  activities: ActivityPayload[]
}
