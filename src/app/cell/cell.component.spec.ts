import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CellComponent } from './cell.component';
import { MinesweeperService } from '../core/minesweeper.service';
import { By } from '@angular/platform-browser';

describe('CellComponent', () => {
    let component: CellComponent;
    let fixture: ComponentFixture<CellComponent>;
    let mockMinesweeperService;
    const cellMock = {
        i: 0,
        isMine: false,
        isMineExploded: false,
        isOpened: true,
        label: "1",
        type: 1,
        x: 0,
        y: 0,
        openedIdClassName: 'opened-1',
    };

    beforeEach(waitForAsync(() => {
        mockMinesweeperService = jasmine.createSpyObj(['']);

        TestBed.configureTestingModule({
            declarations: [CellComponent],
            providers: [
                { provide: MinesweeperService, useValue: mockMinesweeperService }
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CellComponent);
        component = fixture.componentInstance;
        component.cell = cellMock;
        fixture.detectChanges();
    })

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render correct className', () => {        
        expect(fixture.debugElement.query(By.css('button')).nativeElement.className).toContain("cell");
        expect(fixture.debugElement.query(By.css('button')).nativeElement.className).toContain("opened-1");
        expect(fixture.debugElement.query(By.css('button')).nativeElement.className).toContain("opened");
    });
});
