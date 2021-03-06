import React, {Component} from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'chartjs-plugin-colorschemes';
import FHIR from 'fhirclient'
import BarChart from './BarChart';
import PieChart from './PieChart';
import Doughnut from './Doughnut';


const client = FHIR.client("https://apps.hdap.gatech.edu/hapiR4/baseR4");
const NUMPAGES = 0;
var expiration = [];
var form = [];
var code = [];
var status = [];
var ingredient = [];
var ingredient_count = [];
var count = 0;
var batNo = [];
var dispensed = {}
var dispensed_count = 0

class RxSummary extends Component {

    constructor(props) {
        super(props);

        this.state = {};

        this.getMeds = this.getMeds.bind(this);
    }

    // Calls FHIR api to get medication resources
    getMeds() {
        // console.log('click registered')
        this.setState({ loading: true });


        client.request("Medication", { pageLimit: NUMPAGES, flat: true })

        // Log resources and get number of resources
            .then((response) => {

                console.log(response);
                count = response.length;
                for (var i = 0; i < response.length; i++) {
                    if (response[i].batch === undefined) {
                        if (expiration['Unknown'] === undefined) {
                            expiration['Unknown'] = {count: 1, ids: response[i].id + ", "}
                            batNo['Unknown'] = {count: 1, ids: response[i].id + ", "}
                        } else {
                            //console.log(expiration['Unknown']);
                            expiration['Unknown'].count += 1;
                            expiration['Unknown'].ids += response[i].id + ", "
                            batNo['Unknown'].count += 1;
                            batNo['Unknown'].ids += response[i].id + ", "
                        }
                        if (expiration['Unknown'].count % 4 === 0) {
                            expiration['Unknown'].ids += "\n";
                            batNo['Unknown'].ids += "\n";
                        }

                    } else {
                        var year = response[i].batch.expirationDate.split('-')[0];
                        if (expiration[year] === undefined) {
                            expiration[year] = {count: 1, ids: response[i].id}
                        } else {
                            expiration[year].count += 1;
                            expiration[year].ids += "\n " + response[i].id
                        }
                        if (batNo[response[i].batch.lotNumber] === undefined) {
                            batNo[response[i].batch.lotNumber] = {count: 1, ids: response[i].id}
                        } else {
                            batNo[response[i].batch.lotNumber].count += 1;
                            batNo[response[i].batch.lotNumber].ids += "\n " + response[i].id
                        }
                    }

                    if (response[i].code === undefined || response[i].code.coding === undefined || response[i].code.coding[0].system === undefined) {
                        if (code['Unknown'] === undefined) {
                            code['Unknown'] = {count: 1, name: 'Unknown', ids: response[i].id + ", "}
                        } else {
                            code['Unknown'].count += 1
                            code['Unknown'].ids += response[i].id + ", "
                        }
                        if (code['Unknown'].count % 4 === 0) {
                            code['Unknown'].ids += "\n";
                        }
                    } else {
                        var temp_code = response[i].code.coding[0].system.split('/').pop().toLowerCase();
                        if (code[temp_code] === undefined) {
                            code[temp_code] = {count: 1, name: temp_code, ids: response[i].id}
                        } else {
                            code[temp_code].count += 1
                            code[temp_code].ids += "\n " + response[i].id
                        }
                    }

                    if (response[i].form === undefined) {
                        if (form['Unknown'] === undefined) {
                            form['Unknown'] = {count: 1, name: 'Unknown', ids: response[i].id+ ", "}
                        } else {
                            form['Unknown'].count += 1;
                            form['Unknown'].ids += response[i].id+ ", ";
                        }
                        if (form['Unknown'].count % 4 === 0) {
                            form['Unknown'].ids += "\n";
                        }
                    } else {
                        if (form[response[i].form.coding[0].code.toString()] === undefined) {
                            if (response[i].form.coding[0].display === undefined) {
                                form[response[i].form.coding[0].code.toString()] = {count: 1, name: response[i].form.coding[0].code, ids: response[i].id}
                            } else {
                                form[response[i].form.coding[0].code.toString()] = {count: 1, name: response[i].form.coding[0].display, ids: response[i].id}
                            }
                        } else {
                            form[response[i].form.coding[0].code.toString()].count += 1
                            form[response[i].form.coding[0].code.toString()].ids += "\n " + response[i].id;
                        }
                    }

                    if (response[i].status === undefined) {
                        if (status['Unknown'] === undefined) {
                            status['Unknown'] = {count: 1, ids: response[i].id}
                        } else {
                            status['Unknown'].count += 1;
                            status['Unknown'].ids += response[i].id+ ", ";
                        }
                    } else {
                        if (status[response[i].status] === undefined) {
                            status[response[i].status] = {count: 1, ids: response[i].id}
                        } else {
                            status[response[i].status].count += 1;
                            status[response[i].status].ids += '\n' + response[i].id
                        }

                    }
                    if (status['Unknown'].count % 4 === 0) {
                        status['Unknown'].ids += "\n";
                    }

                    if (response[i].ingredient === undefined) {
                        if (ingredient['Unknown'] === undefined) {
                            ingredient['Unknown'] = {count: 1, ids: response[i].id};
                            ingredient_count['Unknown'] = {count: 1, ids: response[i].id};
                        } else {
                            ingredient['Unknown'].count += 1;
                            ingredient['Unknown'].ids += response[i].id+ ", ";
                            ingredient_count['Unknown'].count += 1;
                            ingredient_count['Unknown'].ids += response[i].id+ ", ";
                        }
                        if (ingredient['Unknown'].count % 4 === 0) {
                            ingredient['Unknown'].ids += "\n";
                        }
                        if (ingredient_count['Unknown'].count % 4 === 0) {
                            ingredient_count['Unknown'].ids += "\n";
                        }

                    } else {
                        if (ingredient_count[response[i].ingredient.length] === undefined) {
                            ingredient_count[response[i].ingredient.length] = {count: 1, ids: response[i].id};
                        } else {
                            ingredient_count[response[i].ingredient.length].count += 1;
                            ingredient_count[response[i].ingredient.length].ids += '\n' + response[i].id ;
                        }


                        for (var j = 0; j < response[i].ingredient.length; j++) {
                            if (response[i].ingredient[j].itemCodeableConcept !== undefined) {
                                var temp_ing = response[i].ingredient[j].itemCodeableConcept.coding[0].display;
                                temp_ing = temp_ing.replace(/[^a-zA-Z\s]/g, "").toLowerCase();
                                temp_ing = temp_ing.replace(/substance|mg|ml|injection|solution|injectable|concentrate|and/gi, "");
                                temp_ing = temp_ing.trim();
                                if (ingredient[temp_ing] === undefined) {
                                    ingredient[temp_ing] = {count: 1, ids: response[i].id};
                                } else {
                                    ingredient[temp_ing].count += 1
                                    ingredient[temp_ing].ids += '\n' + response[i].id
                                }
                            }
                        }
                    }
                }
                status['Unknown'].ids = status['Unknown'].ids.replace(/,\s*$/, "");
                form['Unknown'].ids = form['Unknown'].ids.replace(/,\s*$/, "");
                code['Unknown'].ids = code['Unknown'].ids.replace(/,\s*$/, "");
                expiration['Unknown'].ids = expiration['Unknown'].ids.replace(/,\s*$/, "");
                // list = response;
                //Array.sort([form]);
                //console.log("processed all data");
                this.setState({ loading: false })
                // return response.length
            })
            // .then((numMeds) => (
            //     this.setState({ medications: numMeds, loading: false })

            // ))
            .catch((err) => {
                console.log(err);
                this.setState({ loading: false });
            });
    }

    getDispensed() {
        this.setState({ loading: true });

        const updateCount = med_name => {
            if (!(med_name in dispensed)) {
                dispensed[med_name] = 1
            }
            else {
                dispensed[med_name] += 1
            }
        }

        client.request("MedicationDispense", { pageLimit: NUMPAGES, flat: true })
        .then((response) => {
            //console.log(response)
            response.forEach(med_dispense => {
                // Use medication references to update count
                if (med_dispense.medicationReference !== undefined) {
                    updateCount(med_dispense.medicationReference.display)
                }
                
                // Use medication codeable concept to update count
                else if (med_dispense.medicationCodeableConcept !== undefined) {
                    updateCount(med_dispense.medicationCodeableConcept.coding[0].display)
                }

                // Case where medication being administered is not stated
                else {
                    updateCount('Unknown')
                }
            })
            
            dispensed_count = Object.values(dispensed).reduce((a, b) => (
                a + b
            ))
            // console.log(Object.keys(dispensed).length)
            // console.log(Object.values(dispensed).reduce((a,b) => (
            //     a + b
            // )))
            console.log(dispensed)
            this.setState({ loading: false })
        })
        .catch((err) => {
            console.log(err);
            this.setState({ loading: false });
        })
    }
    

    componentDidMount() {
        if (expiration.length === 0) {
            this.getMeds();
            this.getDispensed()
        }
    }

    render () {
        const { loading } = this.state;

        return (
            <div>
                <h2 className="title">Rx Summary</h2>
                    {
                    loading ?
                        (
                            <div className="text-center" >
                                <div className="row">
                                    <div className="spinner-grow text-primary" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                    <div className="spinner-grow text-secondary" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                    <div className="spinner-grow text-success" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                </div>
                                <div className="row">
                                    Page Loading
                                    </div>
                            </div>
                        ) : (
                            <div>
                                <h5 className="title2">Total Medication Records Found: {count}</h5>
                                <h5 className="title2">Total Medications Dispensed: {dispensed_count}</h5>
                                <React.Fragment>
                                    <div className="charDisplay">
                                    <div className="eachgraphGrid">
                                        <BarChart data={expiration}
                                            title={'Medication Expiration date'}
                                            color={['rgba(255, 99, 132, 0.2)',
                                                'rgba(54, 162, 235, 0.2)',
                                                'rgba(255, 206, 86, 0.2)',
                                                'rgba(75, 192, 192, 0.2)',
                                                'rgba(153, 102, 255, 0.2)',
                                                'rgba(255, 159, 64, 0.2)'
                                            ]}
                                        />
                                    </div>
                                    <div className="eachgraphGrid">
                                        <Doughnut data={batNo} title={'Medication Batch Number'}/>
                                    </div>
                                    <div className="eachgraphGrid">
                                        <Doughnut data={ingredient} title={'Medication Ingredients'} />
                                    </div>
                                    <div className="eachgraphGrid">
                                        <BarChart data={ingredient_count} title={'Ingredient Count for Each Medication'} color={['rgba(255, 99, 132, 0.2)',
                                            'rgba(54, 162, 235, 0.2)',
                                            'rgba(255, 206, 86, 0.2)',
                                            'rgba(75, 192, 192, 0.2)',
                                            'rgba(153, 102, 255, 0.2)',
                                            'rgba(255, 159, 64, 0.2)'
                                        ]} />
                                    </div>
                                    <div className="eachgraphGrid">
                                        <PieChart data={code} title={'Medication Code System'}/>
                                    </div>
                                    <div className="eachgraphGrid">
                                        <PieChart data={form} title={'Medication Form'}/>
                                    </div>
                                    <div className="eachgraphGrid">
                                        <Doughnut data={status} title={'Medication Status'}/>
                                    </div>
                                    <div className="eachgraphGrid">
                                        <Doughnut data={dispensed} title={'Amount of Each Medication Dispensed'}/>
                                    </div>
                                    {/* <div className="eachgraphGrid, countSize">
                                        <p>Total {count} Records Found</p>
                                    </div> */}
                                    </div>
                                </React.Fragment>
                            </div>

                        )
                    }

            </div>
        );
    }
};

export default RxSummary;