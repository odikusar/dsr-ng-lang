import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FileService } from '@app/services/file.service';
import { MemoFile } from '@models/memo-file.model';
import { Actions, ofType } from '@ngrx/effects';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { MemoFileFacade } from '@state/memo-file';
import * as fromMemoFileActions from '@state/memo-file/memo-file.actions';
import { MemoRowFacade } from '@state/memo-row';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'dsr-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceComponent implements OnInit {
  private loader = this.loadingBar.useRef();
  private onDestroy$: Subject<void> = new Subject();

  memoFiles$ = this.memoFileFacade.loadAll();
  memoRows$ = this.memoRowFacade.memoRows$;
  selectedMemoFileId$ = this.memoFileFacade.selectedId$;

  constructor(
    private memoFileFacade: MemoFileFacade,
    private fileService: FileService,
    private memoRowFacade: MemoRowFacade,
    private loadingBar: LoadingBarService,
    private actions$: Actions
  ) {}

  ngOnInit(): void {
    this.handleLoader();
  }

  uploadMemoFile(event: Event, memoFile: MemoFile = null): void {
    const target = event.target as HTMLInputElement;

    if (!!target.files) {
      const file = target.files.item(0);

      if (!!file) {
        this.fileService.upload(file, memoFile);
      }
    }
  }

  deleteMemoFile(memoFile: MemoFile): void {
    this.fileService.delete(memoFile);
  }

  readMemoFile(memoFile: MemoFile): void {
    // this.memoRowFacade.loadAll(memoFile);
    this.memoFileFacade.select(memoFile.id);

    // this.http.get(memoFile.url, { responseType: 'text' }).subscribe((data) => {
    //   console.log(data);
    //   const test = this.ngxCsvParser.csvStringToArray(data, ',');
    //   test.pop();
    //   console.error(test[test.length - 1]);
    // });
  }

  private handleLoader() {
    this.loader.start();

    this.actions$
      .pipe(
        ofType(
          fromMemoFileActions.loadAllSuccess,
          fromMemoFileActions.loadAllFail,
          fromMemoFileActions.createFail,
          fromMemoFileActions.createSuccess
        ),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => this.loader.complete());
  }
}
