/**
* Class for the velocity data, epoch is in years,
* vel is in km/s, res1 and res2 are the residuals and
* comp is the either Va or Vb, primary or secondary
*/
export class VelocityRecord {
    public epoch : any;
    public vel : any;
    public res1 : any;
    public res2 : any;
    public comp : any;
}
/**
* Class for the astrometry data, epoch is in years,
* PA in deg, rho in arcsec and error_rho in arcsec
*/
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

      let currentRecord = (<string>csvRecordsArray[i]).trim().split(/\s+/);

      try
      {
        if (currentRecord.length >= 3) {
        	let record;
        	if(type == 'astrometry')
          {
        		record = new AstrometryRecord();
        		record.epoch = currentRecord[0].trim();
        		record.PA = currentRecord[1].trim();
        		record.rho = currentRecord[2].trim();
        		//record.error_rho = currentRecord[3].trim();
        	}
        	else if(type == 'velocity')
        	{
        		record = new VelocityRecord();
        		record.epoch = currentRecord[0].trim();
        		record.vel = currentRecord[1].trim();
        		record.comp = currentRecord[2].trim();
        	}
          csvArr.push(record);
        }
        else{
          console.log("Record skipped with length ", currentRecord.length)
          //throw new Error('Bad header!');
        }
      }
      catch (error) {
        console.error(error);
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
