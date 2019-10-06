export class VelocityRecord {  
    public epoch : any;  
    public vel : any;  
    public res1 : any;
    public res2 : any;
    public comp : any; 
}

export class AstrometryRecord {  
    public epoch : any;  
    public PA : any;  
    public rho : any;  
    public error_rho: any;  
  }   


export class CsvParser {

  public records: any[] = []; 

  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any,
  	hasHeader : boolean, sep : string, type : string) {  
    let csvArr = [];  
    for (let i = 0; i < csvRecordsArray.length; i++) {
      if(hasHeader && i == 0)
      	continue;

      let curruntRecord = (<string>csvRecordsArray[i]).split(/\s+/);

      if (curruntRecord.length == headerLength) {
      	let record;  
      	if(type == 'astrometry'){
      		record = new AstrometryRecord();
      		record.epoch = curruntRecord[0].trim();
      		record.PA = curruntRecord[1].trim();
      		record.rho = curruntRecord[2].trim();
      		record.error_rho = curruntRecord[3].trim(); 
      	}
      	else if(type == 'velocity')
      	{
      		record = new VelocityRecord();
      		record.epoch = curruntRecord[0].trim(); 
      		record.vel = curruntRecord[1].trim();
      		record.res1 = curruntRecord[2].trim();
      		record.res2 = curruntRecord[3].trim();
      		record.comp = curruntRecord[4].trim();
      	}
        csvArr.push(record);  
      }  
    }  
    return csvArr;  
  } 

  getHeaderArray(csvRecordsArr: any, sep : string) {  
    let headers = (<string>csvRecordsArr[0]).split(/\s+/);  
    let headerArray = [];  
    for (let j = 0; j < headers.length; j++) {  
      headerArray.push(headers[j]);  
    }  
    return headerArray;  
  }
}
