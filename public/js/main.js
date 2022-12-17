
//set loading state
const setLoadingState = (isLoading = true) => {
    const loader = document.querySelector('.spinner-border');
    if(isLoading) {
        loader.style.display = 'block';
    } else {
        loader.style.display = 'none';
    }
}

//escape the HTML tags in the displayed text (don't render the HTML!)
function escapeHTML(html) {
    return html.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

//add issues to DOM
const addIssuesToDOM = (issues) => {
    //console.log(issues);

    const issuesDisplay = document.querySelector('#issues');

    issuesDisplay.innerHTML = '';

    if(issues.length === 0) {
        issuesDisplay.innerHTML = '<h4>No Issues Found</h4>';
    } else {
        const issuesCountNotification = document.querySelector('#countOfIssues');
        issuesCountNotification.innerHTML = `<p>${issues.length} issues found on page using the <a href="https://github.com/pa11y/pa11y">pa11y</a>&copy; API</p>`;
        let incrementor = 0;
        issues.forEach((issue) => {
            incrementor++;
            const output =
                `<div class="card mb-5">
                    <div class="card-body">
                    <h4>${incrementor}. ${issue.message}</h4>
                    <p class="bg-light p-3 my-3">
                    ${escapeHTML(issue.context)}
                      </p>
                      <p class="bg-secondary text-light p-2">
                      CODE: ${issue.code}
                    </p>
                    </div>
                </div>
            `
            issuesDisplay.innerHTML += output;
        })
    }
}

let inputStoreCount = 0;
let inputStoreList = [];
//fetch accessibility issues (hit the backend)
const testAccessibility = async (e) => {
    e.preventDefault();

    const url = document.querySelector('#url').value;


    if(url === '') {
        alert('Please input a valid URL')
    } else {
        setLoadingState();

        const response = await fetch(`/api/test?url=${url}`);
        if(response.status !== 200) {
            setLoadingState(false);
            alert('Something went awry...');
        } else {
            const {issues} = await response.json();
            addIssuesToDOM(issues);
            setLoadingState(false);
            const localStorageKey = JSON.stringify(inputStoreCount);
            inputStoreList.push(localStorageKey);

            //add search input to localStorage
            window.localStorage.setItem(localStorageKey, url);
            inputStoreCount++;
        }
    }
    retrieveFromLocalStorage();
}

const clearForm = () => {
    const issuesDisplay = document.querySelector('#issues');
    issuesDisplay.innerHTML = '';

    const searchURL = document.querySelector('#url');
    searchURL.value = '';
    searchURL.autofocus = true;

    const issueCount = document.getElementById('countOfIssues');
    issueCount.innerHTML = '';

    const listPreviousURLSearch = document.querySelector(".btn-group")
    listPreviousURLSearch.innerHTML = '';
    localStorage.clear();
}

const retrieveFromLocalStorage = () => {
    const listPreviousURLSearch = document.querySelector(".btn-group")
    listPreviousURLSearch.innerHTML = '';
    let storeListBreak = 0;
    inputStoreList.every((item) => {
        if(item === null) {
            return false;
        }
        if (storeListBreak % 4 === 0) {
            listPreviousURLSearch.innerHTML = '';
        }
        storeListBreak++;
        const output =
            `<a href="${localStorage.getItem(item)}" class="btn btn-primary">${localStorage.getItem(item)}</a>`
        listPreviousURLSearch.innerHTML += output;
        return true;
    })
}

const downloadCSV = async (e) => {
    e.preventDefault();

    const url = document.querySelector('#url').value;


    if(url === '') {
        alert('Please input a valid URL')
    } else {
        setLoadingState();

        const response = await fetch(`/api/test?url=${url}`);
        if(response.status !== 200) {
            setLoadingState(false);
            alert('Something went awry...');
        } else {
            const {issues} = await response.json();
            addIssuesToDOM(issues);
            setLoadingState(false);
            const localStorageKey = JSON.stringify(inputStoreCount);
            inputStoreList.push(localStorageKey);

            const csv = issues.map(issue => {
                return `${issue.code},${issue.message},${issue.context}`
            }).join('\n')
            const csvBlob = new Blob([csv], { type: 'text/csv' });
            const csvURL = URL.createObjectURL(csvBlob);
            let link = window.document.createElement("a");
            link.href = csvURL;
            link.download = 'accessibility-test' + url.substring(12) + '.csv';
            document.body.appendChild(link);
            link.click();  // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
            document.body.removeChild(link);

            //add search input to localStorage
            window.localStorage.setItem(localStorageKey, url);
            inputStoreCount++;
        }
    }
    retrieveFromLocalStorage();

}

document.querySelector('#form').addEventListener('submit', testAccessibility);
document.querySelector('.btn.btn-secondary').addEventListener('click', clearForm);
document.querySelector('.btn.btn-info').addEventListener('click', downloadCSV);