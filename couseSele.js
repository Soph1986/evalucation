
const Api = (() => {
  const url = "http://localhost:3000/courseList";
  
  const coursePromise = fetch(url).then(res => res.json());
  
  return {
      coursePromise
  };
})();
// View
const View = (() => {
  const dom = {
      avail_container:document.querySelector("#avail_course"),
      select_course:document.querySelector("#select_course"),
      add_btn:document.querySelector("#add_btn"),
      total_score:document.querySelector("#total_score")
      

  };

  // fn to generate template string
  const createTmp = (courses, withButton = true) => {
    let template = "";
    
    courses.forEach(course => {
      
      template += `
        <li data-name="${course.courseName}" >
          <strong>${course.courseName}</strong><br>
          Type: ${course.required ? "Compulsory" : "Elective"}<br>
          Credit: ${course.credit}
        </li>
      `;
    });
    return template;
  };
 
  
  //Render the data within some element
  const render = (elem, temp)=>{
      elem.innerHTML = temp;
  }

  return {
      dom, 
      createTmp, 
      render
  }
})();

const Model = ((view, api) => {
  const { dom, createTmp, render } = view;
  const { coursePromise } = api;

  class Courses {
    #courseList;
    #tempSelections;     // courses user clicked (highlighted)
    #confirmedSelections; // final courses (after clicking Select)
    #totalCredits;

    constructor() {
      this.#courseList = [];
      this.#tempSelections = [];
      this.#confirmedSelections = [];
      this.#totalCredits = 0;

      coursePromise.then(courses => {
        console.log("Fetched courses:", courses);
        this.#courseList = courses;
        const template = createTmp(this.#courseList);
        render(dom.avail_container, template);
      });
    }

    // --- getters ---
    get tempSelections() {
      return this.#tempSelections;
    }
    get confirmedSelections() {
      return this.#confirmedSelections;
    }
    get totalCredits() {
      return this.#totalCredits;
    }
    get courseList() {
      return this.#courseList;
    }

    // --- temporary add/remove (when clicking on Available course li) ---
    toggleTemp(courseName) {
      const course = this.#courseList.find(c => c.courseName === courseName);
      if (!course) return;

      const index = this.#tempSelections.findIndex(c => c.courseName === courseName);

      if (index === -1) {
        // try add
        if (this.#totalCredits + course.credit > 18) {
          alert("You can only choose up to 18 credits in one semester");
          return;
        }
        this.#tempSelections.push(course);
        this.#totalCredits += course.credit;
      } else {
        // remove
        this.#totalCredits -= this.#tempSelections[index].credit;
        this.#tempSelections.splice(index, 1);
      }

      dom.total_score.textContent = this.#totalCredits;
    }

    
    confirmSelections() {
      if (this.#tempSelections.length === 0) {
        alert("Please select at least one course first.");
        return;
      }
  
      const ok = confirm(
        `You have chosen ${this.#totalCredits} credits for this semester. You cannot change once you submit. Do you want to confirm?`
      );
  
      if (!ok) {
       
        return;
      }
  
      // Move temp selections into confirmed
      this.#confirmedSelections = [
        ...this.#confirmedSelections,
        ...this.#tempSelections
      ];
  
      //Render 
      const template = createTmp(this.#confirmedSelections);
      render(dom.select_course, template);
  
    
      this.#tempSelections = [];
      const allLis = dom.avail_container.querySelectorAll("li");
  allLis.forEach(li => li.classList.remove("selected"));

      // disable button
      dom.add_btn.disabled = true;
    }
    


  }

  return { Courses };
})
(View, Api);
// Controller
const Controller = ((model, view) => {
  const { dom } = view;
  const { Courses } = model;
  const init = () => {
    const courses = new Courses();

    // Handle click on Available Courses (toggle)
    dom.avail_container.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (!li) return;

      const courseName = li.dataset.name;
      courses.toggleTemp(courseName);
      li.classList.toggle("selected");  
    });

   
    dom.add_btn.addEventListener("click", () => {
      courses.confirmSelections();
    });
    
  };

  return { init };
})(Model, View)


Controller.init();
